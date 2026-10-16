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

  sensors: {
    enabled: toBoolean('SENSORS_ENABLED', true),
    defaultProvider: optional('SENSOR_DEFAULT_PROVIDER', 'mock'),
    ingestKey: optional('SENSOR_INGEST_KEY', ''),
    http: {
      baseUrl: optional('SENSOR_HTTP_BASE_URL', ''),
      token: optional('SENSOR_HTTP_TOKEN', ''),
    },
  },
})

export type Env = typeof env
