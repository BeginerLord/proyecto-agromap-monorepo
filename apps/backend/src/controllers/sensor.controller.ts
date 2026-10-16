import type { FastifyReply, FastifyRequest } from 'fastify'
import type {
  CreateDeviceDto,
  IdParamDto,
  PaginationQueryDto,
  ProviderParamDto,
  ReadingQueryDto,
  UpdateDeviceDto,
} from '../dtos/index.js'
import type { ISensorService } from '../interfaces/services/index.js'

export class SensorController {
  constructor(private readonly sensors: ISensorService) {}

  providers = () => this.sensors.providers()

  listDevices = (request: FastifyRequest<{ Querystring: PaginationQueryDto }>) =>
    this.sensors.listDevices(request.query)

  getDevice = (request: FastifyRequest<{ Params: IdParamDto }>) => this.sensors.getDevice(request.params.id)

  createDevice = async (request: FastifyRequest<{ Body: CreateDeviceDto }>, reply: FastifyReply) => {
    const device = await this.sensors.createDevice(request.body)
    return reply.status(201).send(device)
  }

  updateDevice = (request: FastifyRequest<{ Params: IdParamDto; Body: UpdateDeviceDto }>) =>
    this.sensors.updateDevice(request.params.id, request.body)

  removeDevice = async (request: FastifyRequest<{ Params: IdParamDto }>, reply: FastifyReply) => {
    await this.sensors.removeDevice(request.params.id)
    return reply.status(204).send()
  }

  listReadings = (request: FastifyRequest<{ Params: IdParamDto; Querystring: ReadingQueryDto }>) =>
    this.sensors.listReadings(request.params.id, request.query)

  syncDevice = (request: FastifyRequest<{ Params: IdParamDto }>) => this.sensors.syncDevice(request.params.id)

  ingest = (request: FastifyRequest<{ Params: ProviderParamDto; Body: unknown }>) =>
    this.sensors.ingest(request.params.provider, request.body)
}
