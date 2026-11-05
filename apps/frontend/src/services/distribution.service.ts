import { distributionsApi } from '@/api'
import type { DistributionPayload, DistributionQuery } from '@/models'

export const distributionService = {
  list: (query: DistributionQuery) => distributionsApi.list(query),
  create: (payload: DistributionPayload) => distributionsApi.create(payload),

  /** Fecha de hoy en formato yyyy-mm-dd (valor por defecto de una nueva jornada). */
  today(from = new Date()): string {
    const date = new Date(from)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  },
}
