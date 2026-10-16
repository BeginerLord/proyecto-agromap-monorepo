import { plotsApi } from '@/api'
import type { Plot, PlotPayload, PlotQuery } from '@/models'
import { toGeoPoint } from '@/utils/geo'

/** Modelo plano del formulario de predio (lat/lng separados para los inputs y el mapa). */
export interface PlotForm {
  name: string
  ownerName: string
  ownerPhone: string
  district: string
  address: string
  lat: number | null
  lng: number | null
  areaM2: number | null
  soilType: string
  waterAccess: '' | NonNullable<Plot['characterization']['waterAccess']>
  sunExposure: '' | NonNullable<Plot['characterization']['sunExposure']>
  landUseHistory: string
  notes: string
}

export const emptyPlotForm = (): PlotForm => ({
  name: '',
  ownerName: '',
  ownerPhone: '',
  district: '',
  address: '',
  lat: null,
  lng: null,
  areaM2: null,
  soilType: '',
  waterAccess: '',
  sunExposure: '',
  landUseHistory: '',
  notes: '',
})

export const plotService = {
  list: (query: PlotQuery) => plotsApi.list(query),
  get: (id: string) => plotsApi.get(id),
  remove: (id: string) => plotsApi.remove(id),

  /** Todos los predios (para mapas y selectores). El piloto maneja pocos registros. */
  async all(): Promise<Plot[]> {
    return (await plotsApi.list({ limit: 100 })).data
  },

  save(form: PlotForm, id?: string): Promise<Plot> {
    const payload = this.toPayload(form)
    return id ? plotsApi.update(id, payload) : plotsApi.create(payload)
  },

  toForm(plot: Plot): PlotForm {
    const [lng, lat] = plot.location.point.coordinates
    return {
      name: plot.name,
      ownerName: plot.owner.name,
      ownerPhone: plot.owner.phone ?? '',
      district: plot.location.district,
      address: plot.location.address ?? '',
      lat,
      lng,
      areaM2: plot.areaM2 ?? null,
      soilType: plot.characterization.soilType ?? '',
      waterAccess: plot.characterization.waterAccess ?? '',
      sunExposure: plot.characterization.sunExposure ?? '',
      landUseHistory: plot.characterization.landUseHistory ?? '',
      notes: plot.characterization.notes ?? '',
    }
  },

  toPayload(form: PlotForm): PlotPayload {
    if (typeof form.lat !== 'number' || typeof form.lng !== 'number') throw new Error('Selecciona la ubicación del predio en el mapa')
    const optional = (value: string) => value.trim() || undefined
    return {
      name: form.name.trim(),
      owner: { name: form.ownerName.trim(), phone: optional(form.ownerPhone) },
      location: {
        municipality: 'Cereté',
        district: form.district.trim(),
        address: optional(form.address),
        point: toGeoPoint(form.lat, form.lng),
      },
      areaM2: typeof form.areaM2 === 'number' ? form.areaM2 : undefined,
      characterization: {
        soilType: optional(form.soilType),
        waterAccess: form.waterAccess || undefined,
        sunExposure: form.sunExposure || undefined,
        landUseHistory: optional(form.landUseHistory),
        notes: optional(form.notes),
      },
    }
  },
}
