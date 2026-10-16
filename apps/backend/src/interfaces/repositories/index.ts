import type {
  CommentAuthorRole,
  CommentStatus,
  CropStatus,
  DeviceStatus,
  FieldLogType,
  HarvestQuality,
  PlotStatus,
} from '../../constants/domain.js'
import type { Role } from '../../constants/roles.js'
import type {
  Comment,
  Crop,
  Device,
  Distribution,
  DistributionItem,
  FieldLog,
  GeoPolygon,
  Harvest,
  Media,
  Plot,
  PlotCharacterization,
  PlotLocation,
  PlotOwner,
  SensorReading,
  User,
  UserWithSecrets,
} from '../entities/index.js'
import type { Filter, IBaseRepository } from './base-repository.interface.js'

export * from './base-repository.interface.js'

// ─── Usuarios ────────────────────────────────────────────
export interface CreateUserData {
  name: string
  email: string
  passwordHash: string
  role: Role
}
export interface UpdateUserData {
  name?: string
  role?: Role
  isActive?: boolean
  lastLoginAt?: Date
  passwordHash?: string
}
export interface IUserRepository extends IBaseRepository<User, CreateUserData, UpdateUserData> {
  findByEmailWithSecrets(email: string): Promise<UserWithSecrets | null>
  findByIdWithSecrets(id: string): Promise<UserWithSecrets | null>
  incrementTokenVersion(id: string): Promise<void>
}

// ─── Predios ─────────────────────────────────────────────
export interface CreatePlotData {
  name: string
  owner: PlotOwner
  location: PlotLocation
  boundary?: GeoPolygon
  areaM2?: number
  characterization?: PlotCharacterization
  status?: PlotStatus
  createdBy?: string
}
export type IPlotRepository = IBaseRepository<Plot, CreatePlotData>

// ─── Cultivos ────────────────────────────────────────────
export interface CreateCropData {
  plot: string
  species: string
  variety?: string
  status?: CropStatus
  plantedAt?: Date
  expectedHarvestAt?: Date
  cycleDays?: number
  areaM2?: number
  plantCount?: number
  notes?: string
  createdBy?: string
}
export interface ICropRepository extends IBaseRepository<Crop, CreateCropData> {
  countByStatus(): Promise<Partial<Record<CropStatus, number>>>
  findUpcomingHarvests(from: Date, to: Date, limit: number): Promise<Crop[]>
}

// ─── Bitácora ────────────────────────────────────────────
export interface CreateFieldLogData {
  crop: string
  plot: string
  date: Date
  type: FieldLogType
  description: string
  photos?: string[]
  author: string
}
export interface IFieldLogRepository extends IBaseRepository<FieldLog, CreateFieldLogData> {
  findRecent(limit: number): Promise<FieldLog[]>
}

// ─── Cosechas ────────────────────────────────────────────
export interface CreateHarvestData {
  crop: string
  plot: string
  harvestedAt: Date
  quantityKg: number
  availableKg: number
  quality: HarvestQuality
  notes?: string
  registeredBy: string
}
export interface HarvestTotals {
  harvestedKg: number
  availableKg: number
}
export interface IHarvestRepository extends IBaseRepository<Harvest, CreateHarvestData> {
  totals(): Promise<HarvestTotals>
  /** Descuenta kilos disponibles de forma atómica; retorna false si no hay suficiente stock. */
  reserveKg(id: string, quantityKg: number): Promise<boolean>
  releaseKg(id: string, quantityKg: number): Promise<void>
}

// ─── Distribuciones (jornadas de apoyo) ──────────────────
export interface CreateDistributionData {
  date: Date
  title: string
  items: DistributionItem[]
  totalKg: number
  beneficiaries: number
  notes?: string
  createdBy: string
}
export interface DistributionTotals {
  count: number
  distributedKg: number
  beneficiaries: number
}
export interface IDistributionRepository extends IBaseRepository<Distribution, CreateDistributionData> {
  totals(): Promise<DistributionTotals>
}

// ─── Sensores ────────────────────────────────────────────
export interface CreateDeviceData {
  name: string
  provider: string
  externalId: string
  kind?: string
  metrics?: string[]
  plot?: string
  crop?: string
  status?: DeviceStatus
  metadata?: Record<string, unknown>
}
export interface UpdateDeviceData extends Partial<CreateDeviceData> {
  lastSeenAt?: Date
}
export interface IDeviceRepository extends IBaseRepository<Device, CreateDeviceData, UpdateDeviceData> {
  findByExternalId(provider: string, externalId: string): Promise<Device | null>
}

export interface CreateSensorReadingData {
  device: string
  plot?: string
  metric: string
  value: number
  unit?: string
  recordedAt: Date
  raw?: unknown
}
export interface ISensorReadingRepository
  extends IBaseRepository<SensorReading, CreateSensorReadingData> {
  insertMany(readings: CreateSensorReadingData[]): Promise<number>
}

// ─── Evidencias (fotos) ──────────────────────────────────
export interface CreateMediaData {
  url: string
  storageKey: string
  mimeType: string
  size: number
  caption?: string
  plot?: string
  crop?: string
  distribution?: string
  isPublic?: boolean
  takenAt?: Date
  uploadedBy: string
}
export interface UpdateMediaData {
  caption?: string
  isPublic?: boolean
}
export interface IMediaRepository extends IBaseRepository<Media, CreateMediaData, UpdateMediaData> {
  findPublic(filter: Filter, limit: number): Promise<Media[]>
  /** Cantidad de fotos públicas y la más reciente (portada) por predio. */
  coversByPlot(plotIds: string[]): Promise<Map<string, { url: string; count: number }>>
  publicByDistribution(distributionIds: string[]): Promise<Map<string, Media[]>>
}

// ─── Experiencias (comentarios) ──────────────────────────
export interface CreateCommentData {
  authorName: string
  authorRole: CommentAuthorRole
  message: string
  rating?: number
  plot?: string
  distribution?: string
  status?: CommentStatus
  ipHash?: string
}
export interface UpdateCommentData {
  status?: CommentStatus
  moderatedBy?: string
  moderatedAt?: Date
}
export interface ICommentRepository extends IBaseRepository<Comment, CreateCommentData, UpdateCommentData> {
  approvedCountByDistribution(distributionIds: string[]): Promise<Map<string, number>>
  countByStatus(): Promise<Partial<Record<CommentStatus, number>>>
}
