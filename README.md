# AgroMap-Cereté

Herramienta de mapeo y seguimiento de cultivos en predios periurbanos (Martínez y Mateo Gómez) para
fortalecer la seguridad alimentaria de los estudiantes en las jornadas sabatinas del Centro Tutorial
Cereté – Universidad de Cartagena.

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
| Frontend | http://localhost:5173 |
| API | http://localhost:3000/api/v1 |
| Documentación (Scalar) | http://localhost:3000/docs |

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

**Módulos:** auth, usuarios, dashboard, predios, cultivos, bitácora, cosechas, jornadas sabatinas y sensores.

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
├── components/   ui/ (base) · layout/ · map/ · dominio (plots, crops, …)
├── composables/  usePaginatedList, useAsyncAction
├── constants/    Rutas, roles, etiquetas y configuración
├── layouts/      AuthLayout, AppLayout
├── models/       Tipos de dominio
├── pages/        Una vista por ruta
├── router/       Rutas y guards (autenticación y roles)
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
