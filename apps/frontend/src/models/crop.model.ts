import type { ISODate, PaginationQuery, PlotRef, Timestamps, UserRef } from './common.model'

export type CropStatus = 'planned' | 'planted' | 'growing' | 'harvesting' | 'finished' | 'lost'

export interface Crop extends Timestamps {
  id: string
  plot: PlotRef
  species: string
  variety?: string
  status: CropStatus
  plantedAt?: ISODate
  expectedHarvestAt?: ISODate
  cycleDays?: number
  areaM2?: number
  plantCount?: number
  notes?: string
  createdBy?: UserRef
}

export interface CropPayload {
  plotId: string
  species: string
  variety?: string
  status?: CropStatus
  plantedAt?: ISODate
  expectedHarvestAt?: ISODate
  cycleDays?: number
  areaM2?: number
  plantCount?: number
  notes?: string
}

export type UpdateCropPayload = Partial<Omit<CropPayload, 'plotId'>>

export interface CropQuery extends PaginationQuery {
  plotId?: string
  status?: CropStatus
}
