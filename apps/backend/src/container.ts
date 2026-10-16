/**
 * Composition root: aquí se instancian y conectan repositorios → servicios → controladores.
 * Es el único lugar que conoce las implementaciones concretas (inyección de dependencias manual).
 */
import { createDefaultRegistry } from './adapters/sensors/index.js'
import { LocalFileStorage } from './adapters/storage/index.js'
import { env } from './config/env.js'
import {
  AuthController,
  CommentController,
  CropController,
  DashboardController,
  DistributionController,
  FieldLogController,
  HarvestController,
  MediaController,
  PlotController,
  PublicController,
  SensorController,
  UserController,
} from './controllers/index.js'
import {
  CommentRepository,
  CropRepository,
  DeviceRepository,
  DistributionRepository,
  FieldLogRepository,
  HarvestRepository,
  MediaRepository,
  PlotRepository,
  SensorReadingRepository,
  UserRepository,
} from './repositories/index.js'
import {
  AuthService,
  CommentService,
  CropService,
  DashboardService,
  DistributionService,
  FieldLogService,
  HarvestService,
  MediaService,
  PlotService,
  PublicService,
  SensorService,
  UserService,
} from './services/index.js'
import { BcryptPasswordHasher, tokenService } from './utils/index.js'

// Adapters
export const sensorRegistry = createDefaultRegistry()
const fileStorage = new LocalFileStorage(env.uploads.dir, env.uploads.publicPath)

// Repositorios
const repositories = {
  users: new UserRepository(),
  plots: new PlotRepository(),
  crops: new CropRepository(),
  fieldLogs: new FieldLogRepository(),
  harvests: new HarvestRepository(),
  distributions: new DistributionRepository(),
  devices: new DeviceRepository(),
  readings: new SensorReadingRepository(),
  media: new MediaRepository(),
  comments: new CommentRepository(),
}

// Servicios
const services = {
  auth: new AuthService(repositories.users, new BcryptPasswordHasher(), tokenService),
  users: new UserService(repositories.users),
  plots: new PlotService(repositories.plots, repositories.crops),
  crops: new CropService(repositories.crops, repositories.plots, repositories.harvests),
  fieldLogs: new FieldLogService(repositories.fieldLogs, repositories.crops),
  harvests: new HarvestService(repositories.harvests, repositories.crops),
  distributions: new DistributionService(repositories.distributions, repositories.harvests),
  dashboard: new DashboardService(
    repositories.plots,
    repositories.crops,
    repositories.harvests,
    repositories.distributions,
    repositories.fieldLogs,
  ),
  sensors: new SensorService(
    sensorRegistry,
    repositories.devices,
    repositories.readings,
    repositories.plots,
    repositories.crops,
  ),
  media: new MediaService(
    repositories.media,
    fileStorage,
    repositories.plots,
    repositories.crops,
    repositories.distributions,
  ),
  comments: new CommentService(repositories.comments, repositories.plots, repositories.distributions),
  public: new PublicService(
    repositories.plots,
    repositories.crops,
    repositories.harvests,
    repositories.distributions,
    repositories.media,
    repositories.comments,
  ),
}

// Controladores
export const controllers = {
  auth: new AuthController(services.auth),
  users: new UserController(services.users),
  plots: new PlotController(services.plots),
  crops: new CropController(services.crops),
  fieldLogs: new FieldLogController(services.fieldLogs),
  harvests: new HarvestController(services.harvests),
  distributions: new DistributionController(services.distributions),
  dashboard: new DashboardController(services.dashboard),
  sensors: new SensorController(services.sensors),
  media: new MediaController(services.media),
  comments: new CommentController(services.comments),
  public: new PublicController(services.public, services.comments),
}

export type Controllers = typeof controllers
