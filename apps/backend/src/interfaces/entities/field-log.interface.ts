import type { FieldLogType } from '../../constants/domain.js'
import type { CropRef, PlotRef, UserRef } from '../common/ref.interface.js'

/** Registro de bitácora de campo asociado a un cultivo. */
export interface FieldLog {
  id: string
  crop: CropRef
  plot: PlotRef
  date: Date
  type: FieldLogType
  description: string
  photos: string[]
  author: UserRef
  createdAt: Date
  updatedAt: Date
}
