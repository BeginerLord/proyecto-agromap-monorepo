/**
 * Tipos de dominio NEUTRALES para lecturas de sensores.
 * Todo adapter traduce el formato propio de su proveedor a estas estructuras,
 * de modo que el resto de la aplicación nunca dependa de un fabricante concreto.
 */

/** Métricas sugeridas. Se aceptan otras (string libre) mientras el hardware no esté definido. */
export const KNOWN_METRICS = {
  SOIL_MOISTURE: 'soil_moisture', // %
  SOIL_TEMPERATURE: 'soil_temperature', // °C
  SOIL_PH: 'soil_ph', // pH
  SOIL_EC: 'soil_ec', // mS/cm
  AIR_TEMPERATURE: 'air_temperature', // °C
  AIR_HUMIDITY: 'air_humidity', // %
  LIGHT: 'light', // lux
  RAINFALL: 'rainfall', // mm
  BATTERY: 'battery', // %
} as const

export type KnownMetric = (typeof KNOWN_METRICS)[keyof typeof KNOWN_METRICS]
export type SensorMetric = KnownMetric | (string & {})

export const DEFAULT_UNITS: Record<KnownMetric, string> = {
  soil_moisture: '%',
  soil_temperature: '°C',
  soil_ph: 'pH',
  soil_ec: 'mS/cm',
  air_temperature: '°C',
  air_humidity: '%',
  light: 'lux',
  rainfall: 'mm',
  battery: '%',
}

/** Lectura normalizada que produce cualquier adapter. */
export interface NormalizedReading {
  /** Id del dispositivo en el sistema del proveedor. */
  externalDeviceId: string
  metric: SensorMetric
  value: number
  unit?: string
  recordedAt: Date
  /** Payload original (se guarda para auditoría / reprocesamiento). */
  raw?: unknown
}

/** Dispositivo tal como lo reporta el proveedor (descubrimiento). */
export interface ExternalDevice {
  externalId: string
  name?: string
  kind?: string
  metrics?: SensorMetric[]
  metadata?: Record<string, unknown>
}

export interface FetchReadingsOptions {
  since?: Date
  until?: Date
  limit?: number
  metrics?: string[]
}

export interface AdapterHealth {
  ok: boolean
  message?: string
  latencyMs?: number
}
