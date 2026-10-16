import type { PaginationQuery, Timestamps, UserRef } from './common.model'

export type PlotStatus = 'active' | 'inactive'
export type WaterAccess = 'none' | 'limited' | 'permanent'
export type SunExposure = 'low' | 'medium' | 'high'

/** GeoJSON: coordinates = [longitud, latitud] */
export interface GeoPoint {
  type: 'Point'
  coordinates: [number, number]
}

export interface GeoPolygon {
  type: 'Polygon'
  coordinates: number[][][]
}

export interface PlotCharacterization {
  soilType?: string
  waterAccess?: WaterAccess
  sunExposure?: SunExposure
  landUseHistory?: string
  notes?: string
}

export interface Plot extends Timestamps {
  id: string
  name: string
  owner: { name: string; phone?: string }
  location: { municipality: string; district: string; address?: string; point: GeoPoint }
  boundary?: GeoPolygon
  areaM2?: number
  characterization: PlotCharacterization
  status: PlotStatus
  createdBy?: UserRef
}

export interface PlotPayload {
  name: string
  owner: { name: string; phone?: string }
  location: { municipality: string; district: string; address?: string; point: GeoPoint }
  areaM2?: number
  characterization?: PlotCharacterization
  status?: PlotStatus
}

export interface PlotQuery extends PaginationQuery {
  district?: string
  status?: PlotStatus
}
