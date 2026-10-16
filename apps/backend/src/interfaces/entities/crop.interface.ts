import type { CropStatus } from '../../constants/domain.js'
import type { PlotRef, UserRef } from '../common/ref.interface.js'

export interface Crop {
  id: string
  plot: PlotRef
  species: string
  variety?: string
  status: CropStatus
  plantedAt?: Date
  expectedHarvestAt?: Date
  /** Duración del ciclo (días) desde la siembra hasta la cosecha. */
  cycleDays?: number
  areaM2?: number
  plantCount?: number
  notes?: string
  createdBy?: UserRef
  createdAt: Date
  updatedAt: Date
}
