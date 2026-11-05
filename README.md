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
│   └── frontend/    SPA · Vue 3 + Vite + TypeScript + Pinia + Mapbox GL JS
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

### Acceso al panel sin login (temporal)

Mientras `AUTH_BYPASS=true` (`apps/backend/.env`) y `VITE_AUTH_BYPASS=true` (`apps/frontend/.env` y el
`build.args` del frontend en `docker-compose.yml`), el panel funciona **sin iniciar sesión**: la API
atiende cada petición como el primer administrador activo y todo lo que se registre queda a su nombre.
Para volver a exigir login, pon ambas variables en `false` y reconstruye (`docker compose up -d --build`).

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
evidencias (fotos), experiencias (comentarios con moderación), estadísticas y reportes
(`GET /reports/summary`: producción y entregas por mes y especie, cultivos, bitácora y predios; exportable
a CSV o PDF desde `/panel/reports`), sitio público y sensores.

### Sitio público y evidencias

- `GET /api/v1/public/*` expone predios activos, jornadas, galería y experiencias aprobadas **sin datos
  privados** (ni propietarios, ni teléfonos, ni usuarios).
- `POST /api/v1/public/comments` recibe experiencias de la comunidad: quedan *pendientes* hasta que un
  administrador o agrónomo las apruebe (`/panel/comments`). Tiene límite de envíos y un campo trampa anti-bots.
- `POST /api/v1/media` sube fotos (JPG/PNG/WEBP, máx. `UPLOAD_MAX_MB`) asociadas a un predio, cultivo o
  jornada. El tipo se valida por los bytes del archivo, no por la extensión.

### Imágenes: Backblaze B2 + WebP

- **Conversión:** toda foto subida se guarda como **WebP** (`sharp`): respeta la orientación del celular,
  elimina metadatos (incluida la ubicación GPS) y reduce a `IMAGE_MAX_DIMENSION` px el lado mayor con
  calidad `IMAGE_WEBP_QUALITY` (82). Una foto de celular de varios MB suele quedar en 100–400 KB.
  Los mapas estáticos de Mapbox también se guardan en WebP.
- **Almacenamiento:** adapter `IFileStorage` (`src/adapters/storage`) con dos implementaciones:
  `S3FileStorage` (Backblaze B2 o cualquier S3 compatible) y `LocalFileStorage` (carpeta `uploads`).
  `STORAGE_DRIVER=s3` usa B2; si faltan las claves, la API usa disco local y lo avisa en el log.
- **Configuración** en `apps/backend/.env`:

  ```env
  STORAGE_DRIVER=s3
  S3_ENDPOINT=https://s3.us-east-005.backblazeb2.com   # B2 → Buckets → Endpoint
  S3_BUCKET=nombre-del-bucket
  S3_ACCESS_KEY_ID=keyID                               # B2 → Application Keys
  S3_SECRET_ACCESS_KEY=applicationKey
  S3_KEY_PREFIX=agromap                                # carpeta dentro del bucket (opcional)
  S3_PUBLIC_URL=                                       # solo si el bucket es público
  ```

- **Cómo se sirven:** con bucket **privado** (recomendado) las URLs son `/uploads/<clave>` y la API lee el
  objeto de B2; nginx guarda una copia 30 días (`X-Cache-Status`) y el navegador la cachea como inmutable,
  así que B2 recibe una sola descarga por imagen. Con bucket público y `S3_PUBLIC_URL`, las URLs apuntan
  directo a B2.
- **Imágenes que ya estaban en disco:** se siguen mostrando y se pueden pasar a B2 (convirtiéndolas a WebP)
  con `pnpm --filter @agromap/backend storage-migrate`
  (Docker: `docker compose exec backend node dist/scripts/storage-migrate.js`).

### Sensores (patrón Adapter)

Los dispositivos aún no están definidos, así que la integración vive en
[`apps/backend/src/adapters/sensors`](apps/backend/src/adapters/sensors/README.md): un contrato
`ISensorAdapter`, un simulador (`mock`), una plantilla REST (`http`) y un esqueleto para nuevos
proveedores. Para conectar el hardware real basta con escribir un adapter y registrarlo.

### Sensores → bitácora (alertas automáticas)

Cada lectura que llega (sincronización o ingesta) se compara con el rango normal de su métrica
(`DEFAULT_SENSOR_THRESHOLDS` en `src/constants/domain.ts`, sobrescribible por dispositivo con el campo
`thresholds`). Si la lectura más reciente sale del rango, `SensorAlertService` crea un registro
**«Alerta de sensor»** en la bitácora del cultivo del dispositivo (o del cultivo activo más reciente de su
predio), con origen `sensor` y sin autor humano. La misma alerta no se repite durante
`SENSOR_ALERT_COOLDOWN_HOURS` (6 h por defecto); `SENSOR_ALERTS_ENABLED=false` la desactiva.

### Mapas (Mapbox) y ahorro de consumo

El token se configura **solo** en `apps/backend/.env`:

```env
MAPBOX_ACCESS_TOKEN=pk.tu_token_publico
MAPBOX_STYLE=mapbox/outdoors-v12
MAPBOX_SNAPSHOTS=true
```

- **Mapa estático guardado:** al registrar un predio (o al cambiar su ubicación), `MapSnapshotService`
  pide **una sola vez** una imagen a la [Static Images API](https://docs.mapbox.com/api/maps/static-images/)
  y la guarda en el almacenamiento de imágenes (B2 o `/uploads`, campo `mapSnapshot` del predio). El detalle del predio (panel y sitio público)
  y las tarjetas sin fotos muestran esa imagen, así que verlos no vuelve a consumir Mapbox. Si la
  ubicación no cambia, no se genera otra.
- **Mapa interactivo:** el tablero, el listado y el formulario (selección de ubicación) usan Mapbox GL JS,
  que se factura por carga de mapa. El navegador obtiene el token desde `GET /api/v1/public/map-config`,
  por eso no hace falta reconstruir el frontend al cambiarlo.
- **Predios existentes:** genera sus mapas estáticos con
  `pnpm --filter @agromap/backend map-snapshots` (Docker: `docker compose exec backend node dist/scripts/map-snapshots.js`).
- Sin token, la API funciona igual y el mapa muestra un aviso.

Recomendado: restringe el token por URL en tu cuenta de Mapbox y revisa sus términos sobre el
almacenamiento de imágenes estáticas.

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
