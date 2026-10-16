import { cropsApi } from '@/api'
import type { Crop, CropPayload, CropQuery, CropStatus, UpdateCropPayload } from '@/models'
import { daysFromToday } from '@/utils/format'

const ACTIVE: CropStatus[] = ['planted', 'growing', 'harvesting']

export const cropService = {
  list: (query: CropQuery) => cropsApi.list(query),
  get: (id: string) => cropsApi.get(id),
  create: (payload: CropPayload) => cropsApi.create(payload),
  update: (id: string, payload: UpdateCropPayload) => cropsApi.update(id, payload),
  remove: (id: string) => cropsApi.remove(id),

  async all(query: CropQuery = {}): Promise<Crop[]> {
    return (await cropsApi.list({ ...query, limit: 100 })).data
  },

  isActive: (crop: Crop) => ACTIVE.includes(crop.status),

  /** Porcentaje del ciclo transcurrido (0-100) entre siembra y cosecha estimada. */
  progress(crop: Crop): number | null {
    if (!crop.plantedAt || !crop.expectedHarvestAt) return null
    if (crop.status === 'finished') return 100
    const start = new Date(crop.plantedAt).getTime()
    const end = new Date(crop.expectedHarvestAt).getTime()
    if (end <= start) return 100
    return Math.min(100, Math.max(0, Math.round(((Date.now() - start) / (end - start)) * 100)))
  },

  daysToHarvest: (crop: Crop) => (crop.expectedHarvestAt ? daysFromToday(crop.expectedHarvestAt) : null),

  label: (crop: Pick<Crop, 'species' | 'variety'>) => (crop.variety ? `${crop.species} · ${crop.variety}` : crop.species),
}
