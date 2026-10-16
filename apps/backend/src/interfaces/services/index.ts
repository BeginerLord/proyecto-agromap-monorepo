import type {
  CreateCropDto,
  CreateDeviceDto,
  CreateDistributionDto,
  CreateFieldLogDto,
  CreateHarvestDto,
  CreatePlotDto,
  CropQueryDto,
  DashboardSummaryDto,
  DistributionQueryDto,
  FieldLogQueryDto,
  HarvestQueryDto,
  IngestResultDto,
  LoginDto,
  PlotQueryDto,
  ReadingQueryDto,
  RegisterDto,
  UpdateCropDto,
  UpdateDeviceDto,
  UpdateFieldLogDto,
  UpdatePlotDto,
  UpdateUserDto,
  UserQueryDto,
  PaginationQueryDto,
  CommentQueryDto,
  CreatePublicCommentDto,
  MediaQueryDto,
  ModerateCommentDto,
  PublicCommentQueryDto,
  PublicGalleryQueryDto,
  PublicDistributionDto,
  PublicMediaDto,
  PublicOverviewDto,
  PublicPlotDetailDto,
  PublicPlotDto,
  UpdateMediaDto,
  UploadMediaFields,
} from '../../dtos/index.js'
import type { AuthTokens, AuthUser } from '../common/auth.interface.js'
import type { PaginatedResult } from '../common/pagination.interface.js'
import type {
  Comment,
  Crop,
  Device,
  Distribution,
  FieldLog,
  Harvest,
  Media,
  Plot,
  SensorReading,
  User,
} from '../entities/index.js'

export * from './security.interface.js'

export interface AuthSession {
  user: User
  tokens: AuthTokens
}

export interface IAuthService {
  register(dto: RegisterDto): Promise<AuthSession>
  login(dto: LoginDto): Promise<AuthSession>
  refresh(refreshToken: string | undefined): Promise<AuthSession>
  logout(userId: string): Promise<void>
  me(userId: string): Promise<User>
}

export interface IUserService {
  list(query: UserQueryDto): Promise<PaginatedResult<User>>
  getById(id: string): Promise<User>
  update(id: string, dto: UpdateUserDto, actor: AuthUser): Promise<User>
}

export interface IPlotService {
  list(query: PlotQueryDto): Promise<PaginatedResult<Plot>>
  getById(id: string): Promise<Plot>
  create(dto: CreatePlotDto, actor: AuthUser): Promise<Plot>
  update(id: string, dto: UpdatePlotDto): Promise<Plot>
  remove(id: string): Promise<void>
}

export interface ICropService {
  list(query: CropQueryDto): Promise<PaginatedResult<Crop>>
  getById(id: string): Promise<Crop>
  create(dto: CreateCropDto, actor: AuthUser): Promise<Crop>
  update(id: string, dto: UpdateCropDto): Promise<Crop>
  remove(id: string): Promise<void>
}

export interface IFieldLogService {
  list(query: FieldLogQueryDto): Promise<PaginatedResult<FieldLog>>
  getById(id: string): Promise<FieldLog>
  create(dto: CreateFieldLogDto, actor: AuthUser): Promise<FieldLog>
  update(id: string, dto: UpdateFieldLogDto, actor: AuthUser): Promise<FieldLog>
  remove(id: string, actor: AuthUser): Promise<void>
}

export interface IHarvestService {
  list(query: HarvestQueryDto): Promise<PaginatedResult<Harvest>>
  getById(id: string): Promise<Harvest>
  create(dto: CreateHarvestDto, actor: AuthUser): Promise<Harvest>
  remove(id: string): Promise<void>
}

export interface IDistributionService {
  list(query: DistributionQueryDto): Promise<PaginatedResult<Distribution>>
  getById(id: string): Promise<Distribution>
  create(dto: CreateDistributionDto, actor: AuthUser): Promise<Distribution>
}

export interface IDashboardService {
  summary(horizonDays: number): Promise<DashboardSummaryDto>
}

export interface ProviderInfo {
  key: string
  displayName: string
  configured: boolean
  isDefault: boolean
}

export interface ISensorService {
  providers(): { enabled: boolean; providers: ProviderInfo[] }
  listDevices(query: PaginationQueryDto): Promise<PaginatedResult<Device>>
  getDevice(id: string): Promise<Device>
  createDevice(dto: CreateDeviceDto): Promise<Device>
  updateDevice(id: string, dto: UpdateDeviceDto): Promise<Device>
  removeDevice(id: string): Promise<void>
  listReadings(deviceId: string, query: ReadingQueryDto): Promise<PaginatedResult<SensorReading>>
  syncDevice(deviceId: string): Promise<IngestResultDto>
  ingest(provider: string, payload: unknown): Promise<IngestResultDto>
}

export interface UploadedFile {
  buffer: Buffer
  originalName: string
}

export interface IMediaService {
  list(query: MediaQueryDto): Promise<PaginatedResult<Media>>
  upload(file: UploadedFile, fields: UploadMediaFields, actor: AuthUser): Promise<Media>
  update(id: string, dto: UpdateMediaDto, actor: AuthUser): Promise<Media>
  remove(id: string, actor: AuthUser): Promise<void>
}

export interface ICommentService {
  list(query: CommentQueryDto): Promise<PaginatedResult<Comment>>
  stats(): Promise<Record<string, number>>
  submit(dto: CreatePublicCommentDto, ip: string): Promise<{ message: string; status: Comment['status'] }>
  moderate(id: string, dto: ModerateCommentDto, actor: AuthUser): Promise<Comment>
  remove(id: string): Promise<void>
}

/** Lectura pública (sin autenticación) con datos depurados. */
export interface IPublicService {
  overview(): Promise<PublicOverviewDto>
  plots(): Promise<{ data: PublicPlotDto[] }>
  plot(id: string): Promise<PublicPlotDetailDto>
  distributions(query: PaginationQueryDto): Promise<PaginatedResult<PublicDistributionDto>>
  gallery(query: PublicGalleryQueryDto): Promise<PublicMediaDto[]>
  comments(query: PublicCommentQueryDto): Promise<PaginatedResult<Comment>>
}
