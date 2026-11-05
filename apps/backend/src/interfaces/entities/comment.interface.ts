import type { CommentAuthorRole, CommentStatus } from '../../constants/domain.js'
import type { PlotRef, UserRef } from '../common/ref.interface.js'

/** Experiencia compartida por un participante desde el sitio público. */
export interface Comment {
  id: string
  authorName: string
  authorRole: CommentAuthorRole
  message: string
  rating?: number
  plot?: PlotRef
  distribution?: { id: string; title: string }
  status: CommentStatus
  moderatedBy?: UserRef
  moderatedAt?: Date
  createdAt: Date
  updatedAt: Date
}
