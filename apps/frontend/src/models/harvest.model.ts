import type { CropRef, ISODate, PaginationQuery, PlotRef, Timestamps, UserRef } from './common.model'

export type HarvestQuality = 'high' | 'medium' | 'low'

export interface Harvest extends Timestamps {
  id: string
  crop: CropRef
  plot: PlotRef
  harvestedAt: ISODate
  quantityKg: number
  availableKg: number
  quality: HarvestQuality
  notes?: string
  registeredBy: UserRef
}

export interface HarvestPayload {
  cropId: string
  harvestedAt?: ISODate
  quantityKg: number
  quality?: HarvestQuality
  notes?: string
}

export interface HarvestQuery extends PaginationQuery {
  cropId?: string
  plotId?: string
  onlyAvailable?: boolean
}
