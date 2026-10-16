import type { ISODate, PaginationQuery, Timestamps, UserRef } from './common.model'

export interface Distribution extends Timestamps {
  id: string
  date: ISODate
  title: string
  items: { harvest: string; species: string; quantityKg: number }[]
  totalKg: number
  beneficiaries: number
  notes?: string
  createdBy: UserRef
}

export interface DistributionPayload {
  date: ISODate
  title?: string
  items: { harvestId: string; quantityKg: number }[]
  beneficiaries: number
  notes?: string
}

export interface DistributionQuery extends PaginationQuery {
  from?: ISODate
  to?: ISODate
}
