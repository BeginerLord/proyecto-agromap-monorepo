import type { PaginationParams, SortSpec } from '../common/pagination.interface.js'

/** Filtro agnóstico al motor de persistencia (los repositorios lo traducen a su query). */
export type Filter = Record<string, unknown>

export interface FindManyOptions extends PaginationParams {
  filter?: Filter
  sort?: SortSpec
}

export interface FindManyResult<T> {
  items: T[]
  total: number
}

/**
 * Contrato genérico de acceso a datos. Los servicios dependen de esta interfaz,
 * nunca de Mongoose directamente, lo que permite cambiar la persistencia o usar mocks en tests.
 */
export interface IBaseRepository<TEntity, TCreate, TUpdate = Partial<TCreate>> {
  create(data: TCreate): Promise<TEntity>
  findById(id: string): Promise<TEntity | null>
  findOne(filter: Filter): Promise<TEntity | null>
  findMany(options: FindManyOptions): Promise<FindManyResult<TEntity>>
  updateById(id: string, data: TUpdate): Promise<TEntity | null>
  deleteById(id: string): Promise<boolean>
  exists(filter: Filter): Promise<boolean>
  count(filter?: Filter): Promise<number>
}
