import type { CropRef, ISODate, PaginationQuery, PlotRef, Timestamps, UserRef } from './common.model'

export type FieldLogType =
  | 'sowing'
  | 'irrigation'
  | 'fertilization'
  | 'pest_control'
  | 'weeding'
  | 'observation'
  | 'harvest'
  | 'other'

export interface FieldLog extends Timestamps {
  id: string
  crop: CropRef
  plot: PlotRef
  date: ISODate
  type: FieldLogType
  description: string
  photos: string[]
  author: UserRef
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
}
