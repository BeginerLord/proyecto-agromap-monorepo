export const PLOT_STATUS = ['active', 'inactive'] as const
export type PlotStatus = (typeof PLOT_STATUS)[number]

export const WATER_ACCESS = ['none', 'limited', 'permanent'] as const
export type WaterAccess = (typeof WATER_ACCESS)[number]

export const SUN_EXPOSURE = ['low', 'medium', 'high'] as const
export type SunExposure = (typeof SUN_EXPOSURE)[number]

export const CROP_STATUS = ['planned', 'planted', 'growing', 'harvesting', 'finished', 'lost'] as const
export type CropStatus = (typeof CROP_STATUS)[number]

export const FIELD_LOG_TYPES = [
  'sowing',
  'irrigation',
  'fertilization',
  'pest_control',
  'weeding',
  'observation',
  'harvest',
  'sensor_alert',
  'other',
] as const
export type FieldLogType = (typeof FIELD_LOG_TYPES)[number]

/** Origen del registro de bitácora: escrito por una persona o generado por un sensor. */
export const FIELD_LOG_SOURCES = ['manual', 'sensor'] as const
export type FieldLogSource = (typeof FIELD_LOG_SOURCES)[number]

export const HARVEST_QUALITY = ['high', 'medium', 'low'] as const
export type HarvestQuality = (typeof HARVEST_QUALITY)[number]

export const DEVICE_STATUS = ['active', 'inactive', 'unknown'] as const
export type DeviceStatus = (typeof DEVICE_STATUS)[number]

export const COMMENT_STATUS = ['pending', 'approved', 'rejected'] as const
export type CommentStatus = (typeof COMMENT_STATUS)[number]

/** Cómo se identifica quien deja su experiencia en el sitio público. */
export const COMMENT_AUTHOR_ROLES = ['student', 'volunteer', 'farmer', 'teacher', 'visitor'] as const
export type CommentAuthorRole = (typeof COMMENT_AUTHOR_ROLES)[number]

export const MEDIA_RULES = {
  MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_FILES_PER_REQUEST: 1,
} as const

/** Rango normal por métrica de sensor. Fuera de él se genera una alerta en la bitácora. */
export interface MetricThreshold {
  min?: number
  max?: number
}

/** Rangos por defecto para cultivos de ciclo corto en clima cálido (Cereté). Cada dispositivo puede sobrescribirlos. */
export const DEFAULT_SENSOR_THRESHOLDS: Record<string, MetricThreshold> = {
  soil_moisture: { min: 30, max: 80 },
  soil_temperature: { min: 15, max: 35 },
  air_temperature: { min: 15, max: 35 },
  air_humidity: { min: 40, max: 95 },
  soil_ph: { min: 5.5, max: 7.5 },
  soil_ec: { max: 2.5 },
  battery: { min: 20 },
}

export const SENSOR_METRIC_LABELS: Record<string, string> = {
  soil_moisture: 'Humedad del suelo',
  soil_temperature: 'Temperatura del suelo',
  soil_ph: 'pH del suelo',
  soil_ec: 'Conductividad eléctrica',
  air_temperature: 'Temperatura del aire',
  air_humidity: 'Humedad relativa',
  light: 'Luminosidad',
  rainfall: 'Precipitación',
  battery: 'Batería',
}

export const PAGINATION = { DEFAULT_PAGE: 1, DEFAULT_LIMIT: 20, MAX_LIMIT: 100 } as const
