import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const envFile = resolve(process.cwd(), '.env')
if (existsSync(envFile)) process.loadEnvFile(envFile)

function required(name: string): string {
  const value = process.env[name]
  if (value === undefined || value.trim() === '') {
    throw new Error(`[config] Falta la variable de entorno obligatoria: ${name}`)
  }
  return value
}

function optional(name: string, fallback: string): string {
  const value = process.env[name]
  return value === undefined || value.trim() === '' ? fallback : value
}

function toNumber(name: string, fallback: number): number {
  const parsed = Number(optional(name, String(fallback)))
  if (Number.isNaN(parsed)) throw new Error(`[config] ${name} debe ser numérico`)
  return parsed
}

function toBoolean(name: string, fallback: boolean): boolean {
  return optional(name, String(fallback)).toLowerCase() === 'true'
}

/** "s3.us-east-005.backblazeb2.com" → "https://s3.us-east-005.backblazeb2.com" (el SDK exige el esquema). */
function withScheme(url: string): string {
  const trimmed = url.trim().replace(/\/+$/, '')
  return !trimmed || /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

/** "evidencias" → "evidencias/"; vacío se mantiene vacío. */
function normalizePrefix(value: string): string {
  const trimmed = value.trim().replace(/^\/+|\/+$/g, '')
  return trimmed ? `${trimmed}/` : ''
}

const nodeEnv = optional('NODE_ENV', 'development')

export const env = Object.freeze({
  nodeEnv,
  isProduction: nodeEnv === 'production',
  host: optional('HOST', '0.0.0.0'),
  port: toNumber('PORT', 3000),
  apiPrefix: optional('API_PREFIX', '/api/v1'),
  logLevel: optional('LOG_LEVEL', 'info'),

  mongoUri: required('MONGO_URI'),

  corsOrigin: optional('CORS_ORIGIN', 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim()),

  auth: {
    /** Modo temporal: el panel funciona sin login (se usa el administrador principal). */
    bypass: toBoolean('AUTH_BYPASS', false),
  },

  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET'),
    refreshSecret: required('JWT_REFRESH_SECRET'),
    accessExpiresIn: optional('JWT_ACCESS_EXPIRES_IN', '15m'),
    refreshExpiresIn: optional('JWT_REFRESH_EXPIRES_IN', '7d'),
  },

  cookie: {
    secret: required('COOKIE_SECRET'),
    domain: optional('COOKIE_DOMAIN', '') || undefined,
    secure: toBoolean('COOKIE_SECURE', nodeEnv === 'production'),
  },

  rateLimit: {
    max: toNumber('RATE_LIMIT_MAX', 200),
    timeWindow: optional('RATE_LIMIT_WINDOW', '1 minute'),
  },

  uploads: {
    dir: resolve(process.cwd(), optional('UPLOADS_DIR', 'uploads')),
    publicPath: '/uploads/',
    maxFileSizeMb: toNumber('UPLOAD_MAX_MB', 5),
  },

  storage: {
    /** local | s3 (Backblaze B2 u otro proveedor compatible con S3). */
    driver: optional('STORAGE_DRIVER', 'local').toLowerCase() === 's3' ? ('s3' as const) : ('local' as const),
    s3: {
      endpoint: withScheme(optional('S3_ENDPOINT', '')),
      // Si no se indica, se toma del endpoint de B2: https://s3.<región>.backblazeb2.com
      region: optional('S3_REGION', /s3\.([\w-]+)\.backblazeb2\.com/.exec(optional('S3_ENDPOINT', ''))?.[1] ?? 'us-east-005'),
      bucket: optional('S3_BUCKET', ''),
      accessKeyId: optional('S3_ACCESS_KEY_ID', ''),
      secretAccessKey: optional('S3_SECRET_ACCESS_KEY', ''),
      keyPrefix: normalizePrefix(optional('S3_KEY_PREFIX', '')),
      forcePathStyle: toBoolean('S3_FORCE_PATH_STYLE', false),
      publicUrl: optional('S3_PUBLIC_URL', ''),
    },
  },

  images: {
    /** Lado mayor máximo en píxeles; las fotos más grandes se reducen (nunca se amplían). */
    maxDimension: toNumber('IMAGE_MAX_DIMENSION', 2048),
    /** Calidad WebP (1-100) de las fotos subidas. */
    webpQuality: Math.min(100, Math.max(1, toNumber('IMAGE_WEBP_QUALITY', 82))),
  },

  mapbox: {
    /** Token público (pk.*) de Mapbox: mapas interactivos y snapshots estáticos. */
    accessToken: optional('MAPBOX_ACCESS_TOKEN', ''),
    /** Estilo "usuario/estilo" para Static Images y GL JS. */
    style: optional('MAPBOX_STYLE', 'mapbox/outdoors-v12'),
    /** Guardar una imagen estática del predio al registrarlo (ahorra peticiones a Mapbox). */
    snapshots: toBoolean('MAPBOX_SNAPSHOTS', true),
  },

  sensors: {
    enabled: toBoolean('SENSORS_ENABLED', true),
    defaultProvider: optional('SENSOR_DEFAULT_PROVIDER', 'mock'),
    ingestKey: optional('SENSOR_INGEST_KEY', ''),
    alertsEnabled: toBoolean('SENSOR_ALERTS_ENABLED', true),
    alertCooldownHours: toNumber('SENSOR_ALERT_COOLDOWN_HOURS', 6),
    http: {
      baseUrl: optional('SENSOR_HTTP_BASE_URL', ''),
      token: optional('SENSOR_HTTP_TOKEN', ''),
    },
  },
})

export type Env = typeof env
