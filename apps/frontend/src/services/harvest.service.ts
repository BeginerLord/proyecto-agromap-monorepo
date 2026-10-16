import { harvestsApi } from '@/api'
import type { Harvest, HarvestPayload, HarvestQuery } from '@/models'

export const harvestService = {
  list: (query: HarvestQuery) => harvestsApi.list(query),
  create: (payload: HarvestPayload) => harvestsApi.create(payload),
  remove: (id: string) => harvestsApi.remove(id),

  /** Cosechas con kilos disponibles para la próxima jornada. */
  async available(): Promise<Harvest[]> {
    return (await harvestsApi.list({ onlyAvailable: true, limit: 100 })).data
  },

  availableRatio: (harvest: Harvest) =>
    harvest.quantityKg > 0 ? Math.round((harvest.availableKg / harvest.quantityKg) * 100) : 0,
}
