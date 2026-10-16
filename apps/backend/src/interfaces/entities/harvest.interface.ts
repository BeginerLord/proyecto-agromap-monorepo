import type { HarvestQuality } from '../../constants/domain.js'
import type { CropRef, PlotRef, UserRef } from '../common/ref.interface.js'

export interface Harvest {
  id: string
  crop: CropRef
  plot: PlotRef
  harvestedAt: Date
  quantityKg: number
  /** Kilos aún disponibles para distribuir en jornadas sabatinas. */
  availableKg: number
  quality: HarvestQuality
  notes?: string
  registeredBy: UserRef
  createdAt: Date
  updatedAt: Date
}
