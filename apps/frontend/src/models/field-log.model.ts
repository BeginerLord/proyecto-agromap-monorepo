import type { CropRef, ISODate, PaginationQuery, PlotRef, Timestamps, UserRef } from './common.model'

export type FieldLogType =
  | 'sowing'
  | 'irrigation'
  | 'fertilization'
  | 'pest_control'
  | 'weeding'
  | 'observation'
  | 'harvest'
  | 'sensor_alert'
  | 'other'

export type FieldLogSource = 'manual' | 'sensor'

export interface SensorAlertInfo {
  device: string
  deviceName: string
  metric: string
  value: number
  unit?: string
  condition: 'low' | 'high'
  threshold: number
  recordedAt: ISODate
}

export interface FieldLog extends Timestamps {
  id: string
  crop: CropRef
  plot: PlotRef
  date: ISODate
  type: FieldLogType
  description: string
  photos: string[]
  /** Ausente en las alertas generadas por sensores. */
  author?: UserRef
  source: FieldLogSource
  sensor?: SensorAlertInfo
}

export interface FieldLogPayload {
  cropId: string
  date?: ISODate
  type: FieldLogType
  description: string
  photos?: string[]
}

export interface FieldLogQuery extends PaginationQuery {
  cropId?: string
  plotId?: string
  type?: FieldLogType
  source?: FieldLogSource
}
