# AgroMap-Cereté

Herramienta de mapeo y seguimiento de cultivos en predios periurbanos (Martínez y Mateo Gómez) para
fortalecer la seguridad alimentaria de los estudiantes mediante jornadas de apoyo alimentario (entre semana
y fines de semana) del Centro Tutorial Cereté – Universidad de Cartagena.

Incluye un **sitio público** (predios con fotos de evidencia, jornadas de apoyo y experiencias de la
comunidad) y un **panel de administración** para el equipo del proyecto.

Monorepo administrado con **pnpm workspaces**:

```
proyecto/
├── apps/
│   ├── backend/     API REST · Fastify 5 + TypeScript + MongoDB (Mongoose) + Scalar
│   └── frontend/    SPA · Vue 3 + Vite + TypeScript + Pinia + Leaflet
└── docs/            Modelado de datos y mockup (.docx), diagrama ER y capturas
```

## Requisitos

- Node.js ≥ 22.12
- pnpm ≥ 10
- MongoDB local en `mongodb://127.0.0.1:27017`

## Puesta en marcha

```bash
pnpm install
```

Cada app tiene su `.env` (ya creado) y un `.env.example` de referencia. Si clonas el repositorio,
copia `.env.example` a `.env` en `apps/backend` y `apps/frontend` y genera secretos nuevos para el JWT.

```bash
pnpm seed
```

Carga un administrador, un agrónomo, los dos predios del piloto y cultivos de ejemplo. Las
credenciales de prueba están en `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` (`apps/backend/.env`) y
en `apps/backend/src/scripts/seed.ts`.

```bash
pnpm dev
```

| Servicio | URL |
| --- | --- |
| Sitio público | http://localhost:5173 |
| Panel de administración | http://localhost:5173/panel |
| API | http://localhost:3000/api/v1 |
| Documentación (Scalar) | http://localhost:3000/docs |

## Con Docker

Levanta MongoDB, la API y el frontend (nginx) sin instalar nada más que Docker. Requiere
`apps/backend/.env` (cópialo desde `.env.example`).

```bash
docker compose up -d --build
docker compose exec backend node dist/scripts/seed.js
```

| Servicio | URL |
| --- | --- |
| Sitio público | http://localhost:8080 |
| Panel de administración | http://localhost:8080/panel |
| API | http://localhost:3000/api/v1 (también vía http://localhost:8080/api/v1) |
| Documentación (Scalar) | http://localhost:3000/docs |
| MongoDB (contenedor) | mongodb://localhost:27018/agromap |

nginx sirve el build de Vue y hace de proxy de `/api`, `/uploads` y `/docs` hacia el backend, así que las
cookies de sesión son del mismo origen. Los datos de Mongo y las fotos subidas persisten en los volúmenes
`mongo-data` y `uploads` (`docker compose down -v` los borra).

## Scripts (raíz)

| Script | Descripción |
| --- | --- |
| `pnpm dev` | Backend y frontend en paralelo con recarga en caliente |
| `pnpm dev:api` / `pnpm dev:web` | Solo una de las apps |
| `pnpm build` | Compila ambas apps (`dist/`) |
| `pnpm typecheck` | Verificación de tipos de todo el monorepo |
| `pnpm seed` | Datos de ejemplo en MongoDB |

## Backend (`apps/backend`)

```
src/
├── adapters/sensors/  Patrón Adapter para sensores IoT (ver su README)
├── config/            Variables de entorno y conexión a MongoDB
├── constants/         Roles, enumeraciones de dominio, nombres de cookies
├── controllers/       Traducen HTTP ⇄ servicios
├── dtos/              Esquemas TypeBox (validación + OpenAPI) y sus tipos
├── exceptions/        Excepciones HTTP y manejador global de errores
├── interfaces/        Entidades, contratos de repositorios y de servicios
├── middlewares/       authenticate, authorize (roles), verifySensorKey
├── models/            Esquemas Mongoose
├── plugins/           Seguridad (helmet, CORS, cookies, rate limit) y docs
├── repositories/      Acceso a datos (implementan las interfaces)
├── routes/            Routers por módulo bajo /api/v1
├── services/          Lógica de negocio
├── utils/             JWT, cookies, hash, paginación, fechas
├── container.ts       Inyección de dependencias (composition root)
├── app.ts / server.ts
```

**Autenticación:** JWT de acceso (15 min) y de refresco (7 días) firmados con secretos distintos y
enviados **solo en cookies `httpOnly` + `SameSite=Lax`**. El refresco rota los tokens y al cerrar
sesión se invalidan los anteriores (`tokenVersion`). El frontend nunca lee ni guarda el token.

**Roles:** `admin`, `agronomist`, `farmer`, `student`.

**Módulos:** auth, usuarios, dashboard, predios, cultivos, bitácora, cosechas, jornadas de apoyo,
evidencias (fotos), experiencias (comentarios con moderación), sitio público y sensores.

### Sitio público y evidencias

- `GET /api/v1/public/*` expone predios activos, jornadas, galería y experiencias aprobadas **sin datos
  privados** (ni propietarios, ni teléfonos, ni usuarios).
- `POST /api/v1/public/comments` recibe experiencias de la comunidad: quedan *pendientes* hasta que un
  administrador o agrónomo las apruebe (`/panel/comments`). Tiene límite de envíos y un campo trampa anti-bots.
- `POST /api/v1/media` sube fotos (JPG/PNG/WEBP, máx. `UPLOAD_MAX_MB`) asociadas a un predio, cultivo o
  jornada. El tipo se valida por los bytes del archivo, no por la extensión. El almacenamiento usa el
  adapter `IFileStorage` (`src/adapters/storage`): hoy disco local en `/uploads`, intercambiable por S3 o
  Cloudinary.

### Sensores (patrón Adapter)

Los dispositivos aún no están definidos, así que la integración vive en
[`apps/backend/src/adapters/sensors`](apps/backend/src/adapters/sensors/README.md): un contrato
`ISensorAdapter`, un simulador (`mock`), una plantilla REST (`http`) y un esqueleto para nuevos
proveedores. Para conectar el hardware real basta con escribir un adapter y registrarlo.

## Frontend (`apps/frontend`)

```
src/
├── api/          Cliente HTTP (axios + cookies) y endpoints por recurso
├── assets/       Logo
├── components/   ui/ (base) · layout/ · public/ · media/ · map/ · dominio (plots, crops, …)
├── composables/  usePaginatedList, useAsyncAction
├── constants/    Rutas, roles, etiquetas y configuración
├── layouts/      PublicLayout, AuthLayout, AppLayout
├── models/       Tipos de dominio
├── pages/        public/ (sitio abierto) y vistas del panel
├── router/       Sitio público en `/`, panel en `/panel` (guards de sesión y roles)
├── services/     Lógica de presentación sobre la API
├── stores/       Pinia (sesión, notificaciones)
├── styles/       Tokens de diseño y estilos base
└── utils/        Formatos y geografía
```

En desarrollo, Vite hace de proxy de `/api` hacia el backend, así que las cookies son del mismo
origen. Diseño: minimalista y orgánico, colores planos derivados del verde del logo (`#066C20`) y
tipografías Fraunces + Figtree.

## Documentación

- [`docs/AgroMap-Modelado-de-Datos.docx`](docs/AgroMap-Modelado-de-Datos.docx): colecciones,
  diccionario de datos, relaciones, índices y reglas de negocio.
- [`docs/AgroMap-Mockup.docx`](docs/AgroMap-Mockup.docx): sistema de diseño, navegación y pantallas.
- [`docs/diagrama-er.png`](docs/diagrama-er.png) y [`docs/mockup/`](docs/mockup): imágenes fuente.
