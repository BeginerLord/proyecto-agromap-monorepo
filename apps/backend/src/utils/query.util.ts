import type { Filter } from '../interfaces/repositories/base-repository.interface.js'

/** Escapa caracteres especiales para construir expresiones regulares seguras. */
export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Construye un filtro `$or` de búsqueda parcial e insensible a mayúsculas sobre varios campos. */
export function searchFilter(search: string | undefined, fields: string[]): Filter {
  const term = search?.trim()
  if (!term) return {}
  const regex = { $regex: escapeRegex(term), $options: 'i' }
  return { $or: fields.map((field) => ({ [field]: regex })) }
}

/** Filtro de rango de fechas `{ field: { $gte, $lte } }` omitiendo límites vacíos. */
export function dateRangeFilter(field: string, from?: string, to?: string): Filter {
  if (!from && !to) return {}
  return {
    [field]: {
      ...(from && { $gte: new Date(from) }),
      ...(to && { $lte: new Date(to) }),
    },
  }
}

/** Elimina las llaves con valor `undefined` (útil antes de persistir actualizaciones parciales). */
export function compact<T extends object>(value: T): Partial<T> {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as Partial<T>
}
