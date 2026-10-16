import { distributionsApi } from '@/api'
import type { DistributionPayload, DistributionQuery } from '@/models'

export const distributionService = {
  list: (query: DistributionQuery) => distributionsApi.list(query),
  create: (payload: DistributionPayload) => distributionsApi.create(payload),

  /** Próximo sábado (la jornada tutorial es sabatina), en formato yyyy-mm-dd. */
  nextSaturday(from = new Date()): string {
    const date = new Date(from)
    date.setDate(date.getDate() + ((6 - date.getDay() + 7) % 7))
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  },
}
