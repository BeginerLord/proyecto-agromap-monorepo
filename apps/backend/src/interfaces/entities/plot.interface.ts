import type { PlotStatus, SunExposure, WaterAccess } from '../../constants/domain.js'
import type { UserRef } from '../common/ref.interface.js'

/** GeoJSON Point: coordinates = [longitud, latitud] */
export interface GeoPoint {
  type: 'Point'
  coordinates: [number, number]
}

/** GeoJSON Polygon: anillos de [longitud, latitud] */
export interface GeoPolygon {
  type: 'Polygon'
  coordinates: number[][][]
}

export interface PlotOwner {
  name: string
  phone?: string
}

export interface PlotLocation {
  municipality: string
  /** Corregimiento (p. ej. Martínez, Mateo Gómez) */
  district: string
  address?: string
  point: GeoPoint
}

/** Caracterización agroecológica levantada en la Fase I (diagnóstico). */
export interface PlotCharacterization {
  soilType?: string
  waterAccess?: WaterAccess
  sunExposure?: SunExposure
  landUseHistory?: string
  notes?: string
}

export interface Plot {
  id: string
  name: string
  owner: PlotOwner
  location: PlotLocation
  boundary?: GeoPolygon
  areaM2?: number
  characterization: PlotCharacterization
  status: PlotStatus
  createdBy?: UserRef
  createdAt: Date
  updatedAt: Date
}
