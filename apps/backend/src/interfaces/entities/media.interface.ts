import type { CropRef, PlotRef, UserRef } from '../common/ref.interface.js'

/** Evidencia fotográfica de un predio, cultivo o jornada. */
export interface Media {
  id: string
  url: string
  storageKey: string
  mimeType: string
  size: number
  caption?: string
  plot?: PlotRef
  crop?: CropRef
  distribution?: string
  isPublic: boolean
  takenAt?: Date
  uploadedBy: UserRef
  createdAt: Date
  updatedAt: Date
}
