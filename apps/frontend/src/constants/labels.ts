import type { CropStatus, FieldLogType, HarvestQuality, SunExposure, WaterAccess } from '@/models'
import type { Role } from './roles'

/** Tonos de la paleta usados por BaseBadge. */
export type Tone = 'leaf' | 'soil' | 'sun' | 'water' | 'clay' | 'neutral'

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrador',
  agronomist: 'Agrónomo',
  farmer: 'Agricultor',
  student: 'Estudiante',
}

export const CROP_STATUS: Record<CropStatus, { label: string; tone: Tone }> = {
  planned: { label: 'Planificado', tone: 'neutral' },
  planted: { label: 'Sembrado', tone: 'soil' },
  growing: { label: 'En crecimiento', tone: 'leaf' },
  harvesting: { label: 'En cosecha', tone: 'sun' },
  finished: { label: 'Finalizado', tone: 'water' },
  lost: { label: 'Perdido', tone: 'clay' },
}

export const FIELD_LOG_TYPES: Record<FieldLogType, { label: string; tone: Tone }> = {
  sowing: { label: 'Siembra', tone: 'soil' },
  irrigation: { label: 'Riego', tone: 'water' },
  fertilization: { label: 'Fertilización', tone: 'leaf' },
  pest_control: { label: 'Control fitosanitario', tone: 'clay' },
  weeding: { label: 'Deshierbe', tone: 'soil' },
  observation: { label: 'Observación', tone: 'neutral' },
  harvest: { label: 'Cosecha', tone: 'sun' },
  other: { label: 'Otro', tone: 'neutral' },
}

export const HARVEST_QUALITY: Record<HarvestQuality, { label: string; tone: Tone }> = {
  high: { label: 'Alta', tone: 'leaf' },
  medium: { label: 'Media', tone: 'sun' },
  low: { label: 'Baja', tone: 'clay' },
}

export const WATER_ACCESS: Record<WaterAccess, string> = {
  none: 'Sin acceso',
  limited: 'Limitado',
  permanent: 'Permanente',
}

export const SUN_EXPOSURE: Record<SunExposure, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
}

export const METRIC_LABELS: Record<string, string> = {
  soil_moisture: 'Humedad del suelo',
  soil_temperature: 'Temperatura del suelo',
  soil_ph: 'pH del suelo',
  soil_ec: 'Conductividad',
  air_temperature: 'Temperatura del aire',
  air_humidity: 'Humedad relativa',
  light: 'Luminosidad',
  rainfall: 'Precipitación',
  battery: 'Batería',
}

/** Corregimientos del piloto. */
export const DISTRICTS = ['Martínez', 'Mateo Gómez']

export const toOptions = <T extends string>(record: Record<T, string | { label: string }>) =>
  (Object.entries(record) as [T, string | { label: string }][]).map(([value, item]) => ({
    value,
    label: typeof item === 'string' ? item : item.label,
  }))
