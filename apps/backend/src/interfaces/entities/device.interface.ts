import type { DeviceStatus } from '../../constants/domain.js'
import type { CropRef, PlotRef } from '../common/ref.interface.js'

/**
 * Dispositivo/sensor de campo. Los campos `kind`, `metrics` y `metadata` son abiertos
 * a propósito: el hardware aún no está definido y cada proveedor (adapter) los llenará.
 */
export interface Device {
  id: string
  name: string
  provider: string
  externalId: string
  kind?: string
  metrics: string[]
  plot?: PlotRef
  crop?: CropRef
  status: DeviceStatus
  lastSeenAt?: Date
  metadata?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

export interface SensorReading {
  id: string
  device: string
  plot?: string
  metric: string
  value: number
  unit?: string
  recordedAt: Date
  createdAt: Date
}
