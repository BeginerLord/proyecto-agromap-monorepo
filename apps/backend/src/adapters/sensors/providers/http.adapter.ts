import { BaseSensorAdapter } from '../base-sensor.adapter.js'
import type { AdapterHealth, ExternalDevice, FetchReadingsOptions, NormalizedReading } from '../sensor.types.js'

export interface HttpSensorAdapterConfig {
  baseUrl: string
  token?: string
  timeoutMs?: number
}

/**
 * Adapter genérico para proveedores con API REST.
 *
 * ⚠️ PLANTILLA: los endpoints y el formato de respuesta son supuestos. Cuando se conozca
 * la API real del fabricante, ajusta `paths` y el método `mapReading()`; el resto de la
 * aplicación no necesita cambios.
 */
export class HttpSensorAdapter extends BaseSensorAdapter {
  readonly key = 'http'
  readonly displayName = 'API REST genérica'

  private readonly paths = {
    health: '/health',
    devices: '/devices',
    readings: (id: string) => `/devices/${encodeURIComponent(id)}/readings`,
  }

  constructor(private readonly config: HttpSensorAdapterConfig) {
    super()
  }

  override isConfigured(): boolean {
    return Boolean(this.config.baseUrl)
  }

  override async healthCheck(): Promise<AdapterHealth> {
    if (!this.isConfigured()) return { ok: false, message: 'Define SENSOR_HTTP_BASE_URL' }
    const started = Date.now()
    try {
      await this.request(this.paths.health)
      return { ok: true, latencyMs: Date.now() - started }
    } catch (error) {
      return { ok: false, message: (error as Error).message }
    }
  }

  override async listDevices(): Promise<ExternalDevice[]> {
    const body = await this.request<unknown[]>(this.paths.devices)
    return (Array.isArray(body) ? body : []).filter(this.isRecord).map((item) => ({
      externalId: String(item.id ?? item.deviceId),
      name: typeof item.name === 'string' ? item.name : undefined,
      kind: typeof item.type === 'string' ? item.type : undefined,
      metadata: item,
    }))
  }

  async fetchReadings(externalDeviceId: string, options: FetchReadingsOptions = {}): Promise<NormalizedReading[]> {
    const query = new URLSearchParams()
    if (options.since) query.set('since', options.since.toISOString())
    if (options.until) query.set('until', options.until.toISOString())
    if (options.limit) query.set('limit', String(options.limit))

    const body = await this.request<unknown>(`${this.paths.readings(externalDeviceId)}?${query}`)
    return this.normalize({ deviceId: externalDeviceId, readings: body })
  }

  /** Formato asumido: { deviceId, readings: [{ metric, value, unit?, timestamp }] } */
  normalize(payload: unknown): NormalizedReading[] {
    const items = Array.isArray(payload) ? payload : [payload]
    return items.flatMap((item) => {
      if (!this.isRecord(item)) return []
      const deviceId = String(item.deviceId ?? item.device_id ?? '')
      const readings = Array.isArray(item.readings) ? item.readings : []
      return readings.flatMap((reading) => this.mapReading(deviceId, reading))
    })
  }

  /** Punto único de mapeo campo-a-campo del proveedor → dominio. */
  private mapReading(deviceId: string, reading: unknown): NormalizedReading[] {
    if (!deviceId || !this.isRecord(reading)) return []
    const metric = String(reading.metric ?? reading.type ?? '')
    const value = this.toNumber(reading.value)
    if (!metric || value === null) return []
    return [
      {
        externalDeviceId: deviceId,
        metric,
        value,
        unit: typeof reading.unit === 'string' ? reading.unit : this.defaultUnit(metric),
        recordedAt: this.toDate(reading.timestamp ?? reading.ts),
        raw: reading,
      },
    ]
  }

  private async request<T>(path: string): Promise<T> {
    if (!this.isConfigured()) throw new Error('HttpSensorAdapter sin configurar (SENSOR_HTTP_BASE_URL)')
    const response = await fetch(new URL(path, this.config.baseUrl), {
      headers: {
        Accept: 'application/json',
        ...(this.config.token && { Authorization: `Bearer ${this.config.token}` }),
      },
      signal: AbortSignal.timeout(this.config.timeoutMs ?? 10_000),
    })
    if (!response.ok) throw new Error(`Proveedor respondió ${response.status}`)
    return (await response.json()) as T
  }
}
