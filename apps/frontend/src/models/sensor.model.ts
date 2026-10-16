import type { CropRef, ISODate, PaginationQuery, PlotRef, Timestamps } from './common.model'

export type DeviceStatus = 'active' | 'inactive' | 'unknown'

export interface SensorProvider {
  key: string
  displayName: string
  configured: boolean
  isDefault: boolean
}

export interface Device extends Timestamps {
  id: string
  name: string
  provider: string
  externalId: string
  kind?: string
  metrics: string[]
  plot?: PlotRef
  crop?: CropRef
  status: DeviceStatus
  lastSeenAt?: ISODate
  metadata?: Record<string, unknown>
}

export interface DevicePayload {
  name: string
  provider?: string
  externalId: string
  kind?: string
  metrics?: string[]
  plotId?: string
  cropId?: string
}

export interface SensorReading {
  id: string
  device: string
  plot?: string
  metric: string
  value: number
  unit?: string
  recordedAt: ISODate
  createdAt: ISODate
}

export interface ReadingQuery extends PaginationQuery {
  metric?: string
  from?: ISODate
  to?: ISODate
}

export interface SyncResult {
  provider: string
  received: number
  stored: number
  skipped: number
}
