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
  'other',
] as const
export type FieldLogType = (typeof FIELD_LOG_TYPES)[number]

export const HARVEST_QUALITY = ['high', 'medium', 'low'] as const
export type HarvestQuality = (typeof HARVEST_QUALITY)[number]

export const DEVICE_STATUS = ['active', 'inactive', 'unknown'] as const
export type DeviceStatus = (typeof DEVICE_STATUS)[number]

export const PAGINATION = { DEFAULT_PAGE: 1, DEFAULT_LIMIT: 20, MAX_LIMIT: 100 } as const
