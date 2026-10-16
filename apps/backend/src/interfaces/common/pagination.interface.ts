export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginationMeta extends PaginationParams {
  total: number
  totalPages: number
}

export interface PaginatedResult<T> {
  data: T[]
  meta: PaginationMeta
}

export type SortDirection = 1 | -1
export type SortSpec = Record<string, SortDirection>
