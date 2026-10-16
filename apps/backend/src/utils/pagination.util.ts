import { PAGINATION } from '../constants/domain.js'
import type { PaginatedResult, PaginationParams } from '../interfaces/common/pagination.interface.js'
import type { FindManyResult } from '../interfaces/repositories/base-repository.interface.js'

export function resolvePagination(query: { page?: number; limit?: number }): PaginationParams {
  const page = Math.max(query.page ?? PAGINATION.DEFAULT_PAGE, 1)
  const limit = Math.min(Math.max(query.limit ?? PAGINATION.DEFAULT_LIMIT, 1), PAGINATION.MAX_LIMIT)
  return { page, limit }
}

export function toPaginated<T>({ items, total }: FindManyResult<T>, { page, limit }: PaginationParams): PaginatedResult<T> {
  return {
    data: items,
    meta: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
  }
}
