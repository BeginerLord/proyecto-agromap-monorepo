import type { FieldLogSource, FieldLogType } from '../../constants/domain.js'
import type { CropRef, PlotRef, UserRef } from '../common/ref.interface.js'

export interface SensorAlertInfo {
  device: string
  deviceName: string
  metric: string
  value: number
  unit?: string
  condition: 'low' | 'high'
  threshold: number
  recordedAt: Date
}

/** Registro de bitácora de campo asociado a un cultivo. */
export interface FieldLog {
  id: string
  crop: CropRef
  plot: PlotRef
  date: Date
  type: FieldLogType
  description: string
  photos: string[]
  /** Ausente en las alertas generadas por sensores. */
  author?: UserRef
  source: FieldLogSource
  sensor?: SensorAlertInfo
  createdAt: Date
  updatedAt: Date
}
