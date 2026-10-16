export type ISODate = string

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface Paginated<T> {
  data: T[]
  meta: PaginationMeta
}

export interface PaginationQuery {
  page?: number
  limit?: number
  search?: string
}

export interface ApiErrorBody {
  statusCode: number
  error: string
  message: string
  details?: { field?: string; message?: string }[]
}

export interface Timestamps {
  createdAt: ISODate
  updatedAt: ISODate
}

export interface UserRef {
  id: string
  name: string
}

export interface PlotRef {
  id: string
  name: string
}

export interface CropRef {
  id: string
  species: string
  variety?: string
}
