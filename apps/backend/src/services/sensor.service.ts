import type { ISensorAdapter } from '../adapters/sensors/sensor-adapter.interface.js'
import type { SensorAdapterRegistry } from '../adapters/sensors/sensor-adapter.registry.js'
import type { NormalizedReading } from '../adapters/sensors/sensor.types.js'
import { env } from '../config/env.js'
import type {
  CreateDeviceDto,
  IngestResultDto,
  PaginationQueryDto,
  ReadingQueryDto,
  UpdateDeviceDto,
} from '../dtos/index.js'
import { BadRequestException, NotFoundException, ServiceUnavailableException } from '../exceptions/index.js'
import type { PaginatedResult } from '../interfaces/common/pagination.interface.js'
import type { Device, SensorReading } from '../interfaces/entities/index.js'
import type {
  CreateSensorReadingData,
  ICropRepository,
  IDeviceRepository,
  IPlotRepository,
  ISensorReadingRepository,
} from '../interfaces/repositories/index.js'
import type { ISensorService, ProviderInfo } from '../interfaces/services/index.js'
import { compact, dateRangeFilter, resolvePagination, searchFilter, toPaginated } from '../utils/index.js'

/**
 * Cliente del patrón Adapter: orquesta dispositivos y lecturas sin conocer
 * el proveedor concreto. Toda comunicación con el hardware pasa por `ISensorAdapter`.
 */
export class SensorService implements ISensorService {
  constructor(
    private readonly registry: SensorAdapterRegistry,
    private readonly devices: IDeviceRepository,
    private readonly readings: ISensorReadingRepository,
    private readonly plots: IPlotRepository,
    private readonly crops: ICropRepository,
  ) {}

  providers(): { enabled: boolean; providers: ProviderInfo[] } {
    return {
      enabled: env.sensors.enabled,
      providers: this.registry.list().map((adapter) => ({
        key: adapter.key,
        displayName: adapter.displayName,
        configured: adapter.isConfigured(),
        isDefault: adapter.key === this.registry.defaultProvider,
      })),
    }
  }

  async listDevices(query: PaginationQueryDto): Promise<PaginatedResult<Device>> {
    const pagination = resolvePagination(query)
    const filter = searchFilter(query.search, ['name', 'externalId', 'kind'])
    return toPaginated(await this.devices.findMany({ ...pagination, filter }), pagination)
  }

  async getDevice(id: string): Promise<Device> {
    const device = await this.devices.findById(id)
    if (!device) throw new NotFoundException('Dispositivo', id)
    return device
  }

  async createDevice(dto: CreateDeviceDto): Promise<Device> {
    const provider = dto.provider ?? this.registry.defaultProvider
    this.resolveAdapter(provider)
    await this.assertRelations(dto.plotId, dto.cropId)
    const { plotId, cropId, ...rest } = dto
    return this.devices.create({ ...rest, provider, plot: plotId, crop: cropId })
  }

  async updateDevice(id: string, dto: UpdateDeviceDto): Promise<Device> {
    if (dto.provider) this.resolveAdapter(dto.provider)
    await this.assertRelations(dto.plotId, dto.cropId)
    const { plotId, cropId, ...rest } = dto
    const device = await this.devices.updateById(id, compact({ ...rest, plot: plotId, crop: cropId }))
    if (!device) throw new NotFoundException('Dispositivo', id)
    return device
  }

  async removeDevice(id: string): Promise<void> {
    if (!(await this.devices.deleteById(id))) throw new NotFoundException('Dispositivo', id)
  }

  async listReadings(deviceId: string, query: ReadingQueryDto): Promise<PaginatedResult<SensorReading>> {
    await this.getDevice(deviceId)
    const pagination = resolvePagination(query)
    const filter = {
      device: deviceId,
      ...(query.metric && { metric: query.metric }),
      ...dateRangeFilter('recordedAt', query.from, query.to),
    }
    return toPaginated(await this.readings.findMany({ ...pagination, filter }), pagination)
  }

  /** Modo PULL: pide al proveedor las lecturas nuevas del dispositivo. */
  async syncDevice(deviceId: string): Promise<IngestResultDto> {
    const device = await this.getDevice(deviceId)
    const adapter = this.resolveAdapter(device.provider)
    const normalized = await adapter.fetchReadings(device.externalId, {
      since: device.lastSeenAt,
      metrics: device.metrics.length ? device.metrics : undefined,
    })
    return this.persist(adapter, normalized)
  }

  /** Modo PUSH: el gateway/proveedor envía un payload crudo y el adapter lo normaliza. */
  async ingest(provider: string, payload: unknown): Promise<IngestResultDto> {
    const adapter = this.resolveAdapter(provider)
    const normalized = adapter.normalize(payload)
    if (normalized.length === 0) throw new BadRequestException('El payload no contiene lecturas reconocibles')
    return this.persist(adapter, normalized)
  }

  private async persist(adapter: ISensorAdapter, normalized: NormalizedReading[]): Promise<IngestResultDto> {
    const deviceCache = new Map<string, Device | null>()
    const docs: CreateSensorReadingData[] = []
    const lastSeen = new Map<string, Date>()

    for (const reading of normalized) {
      if (!deviceCache.has(reading.externalDeviceId)) {
        deviceCache.set(
          reading.externalDeviceId,
          await this.devices.findByExternalId(adapter.key, reading.externalDeviceId),
        )
      }
      const device = deviceCache.get(reading.externalDeviceId)
      if (!device) continue // dispositivo no registrado → se ignora la lectura

      docs.push({
        device: device.id,
        plot: device.plot?.id,
        metric: reading.metric,
        value: reading.value,
        unit: reading.unit,
        recordedAt: reading.recordedAt,
        raw: reading.raw,
      })
      const previous = lastSeen.get(device.id)
      if (!previous || reading.recordedAt > previous) lastSeen.set(device.id, reading.recordedAt)
    }

    const stored = await this.readings.insertMany(docs)
    await Promise.all(
      [...lastSeen].map(([id, date]) => this.devices.updateById(id, { lastSeenAt: date, status: 'active' })),
    )
    return { provider: adapter.key, received: normalized.length, stored, skipped: normalized.length - stored }
  }

  private resolveAdapter(provider: string): ISensorAdapter {
    if (!env.sensors.enabled) throw new ServiceUnavailableException('El módulo de sensores está deshabilitado')
    const adapter = this.registry.get(provider)
    if (!adapter) throw new BadRequestException(`Proveedor de sensores desconocido: "${provider}"`)
    if (!adapter.isConfigured()) throw new ServiceUnavailableException(`El proveedor "${provider}" no está configurado`)
    return adapter
  }

  private async assertRelations(plotId?: string, cropId?: string): Promise<void> {
    if (plotId && !(await this.plots.exists({ _id: plotId }))) throw new NotFoundException('Predio', plotId)
    if (cropId && !(await this.crops.exists({ _id: cropId }))) throw new NotFoundException('Cultivo', cropId)
  }
}
