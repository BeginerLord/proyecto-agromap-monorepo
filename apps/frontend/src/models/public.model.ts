import type { CropStatus } from './crop.model'
import type { ISODate, PaginationQuery, PlotRef, Timestamps, UserRef, CropRef } from './common.model'
import type { GeoPoint, SunExposure, WaterAccess } from './plot.model'

// ─── Sitio público ───────────────────────────────────────
export interface PublicMedia {
  id: string
  url: string
  caption?: string
  plot?: PlotRef
  crop?: { species: string }
  takenAt?: ISODate
  createdAt: ISODate
}

export interface PublicCrop {
  id: string
  species: string
  variety?: string
  status: CropStatus
  plantedAt?: ISODate
  expectedHarvestAt?: ISODate
}

export interface PublicPlot {
  id: string
  name: string
  location: { municipality: string; district: string; point: GeoPoint }
  areaM2?: number
  characterization: { soilType?: string; waterAccess?: WaterAccess; sunExposure?: SunExposure }
  coverUrl?: string
  photoCount: number
  crops: PublicCrop[]
}

export interface PublicPlotDetail extends PublicPlot {
  gallery: PublicMedia[]
}

export interface PublicDistribution {
  id: string
  date: ISODate
  title: string
  items: { species: string; quantityKg: number }[]
  totalKg: number
  beneficiaries: number
  notes?: string
  photos: PublicMedia[]
  commentCount: number
}

export interface PublicOverview {
  plots: number
  activeCrops: number
  harvestedKg: number
  distributedKg: number
  beneficiaries: number
  distributions: number
  upcomingHarvests: { species: string; variety?: string; plot: PlotRef; expectedHarvestAt: ISODate }[]
}

// ─── Experiencias (comentarios) ──────────────────────────
export type CommentStatus = 'pending' | 'approved' | 'rejected'
export type CommentAuthorRole = 'student' | 'volunteer' | 'farmer' | 'teacher' | 'visitor'

export interface PublicComment {
  id: string
  authorName: string
  authorRole: CommentAuthorRole
  message: string
  rating?: number
  plot?: PlotRef
  distribution?: { id: string; title: string }
  createdAt: ISODate
}

export interface Comment extends PublicComment, Timestamps {
  status: CommentStatus
  moderatedBy?: UserRef
  moderatedAt?: ISODate
}

export interface CommentPayload {
  authorName: string
  authorRole?: CommentAuthorRole
  message: string
  rating?: number
  plotId?: string
  distributionId?: string
  /** Honeypot: siempre vacío desde la UI. */
  website?: string
}

export interface PublicCommentQuery extends PaginationQuery {
  plotId?: string
  distributionId?: string
}

export interface CommentQuery extends PaginationQuery {
  status?: CommentStatus
}

// ─── Evidencias (panel) ──────────────────────────────────
export interface Media extends Timestamps {
  id: string
  url: string
  mimeType: string
  size: number
  caption?: string
  plot?: PlotRef
  crop?: CropRef
  distribution?: string
  isPublic: boolean
  takenAt?: ISODate
  uploadedBy: UserRef
}

export interface MediaOwner {
  plotId?: string
  cropId?: string
  distributionId?: string
}
