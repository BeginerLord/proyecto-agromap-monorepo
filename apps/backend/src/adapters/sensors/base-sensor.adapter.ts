import type { ISensorAdapter } from './sensor-adapter.interface.js'
import {
  DEFAULT_UNITS,
  type AdapterHealth,
  type ExternalDevice,
  type FetchReadingsOptions,
  type KnownMetric,
  type NormalizedReading,
} from './sensor.types.js'

/**
 * Clase base con utilidades comunes. Los adapters concretos solo implementan
 * lo específico de su proveedor.
 */
export abstract class BaseSensorAdapter implements ISensorAdapter {
  abstract readonly key: string
  abstract readonly displayName: string

  protected connected = false

  isConfigured(): boolean {
    return true
  }

  async connect(): Promise<void> {
    this.connected = true
  }

  async disconnect(): Promise<void> {
    this.connected = false
  }

  async healthCheck(): Promise<AdapterHealth> {
    return { ok: this.isConfigured(), message: this.isConfigured() ? 'OK' : 'Adapter sin configurar' }
  }

  async listDevices(): Promise<ExternalDevice[]> {
    return []
  }

  abstract fetchReadings(externalDeviceId: string, options?: FetchReadingsOptions): Promise<NormalizedReading[]>
  abstract normalize(payload: unknown): NormalizedReading[]

  // ─── Helpers para subclases ─────────────────────────────

  protected toNumber(value: unknown): number | null {
    const parsed = typeof value === 'string' ? Number(value.replace(',', '.')) : Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  protected toDate(value: unknown, fallback = new Date()): Date {
    if (value instanceof Date) return value
    if (typeof value === 'number') return new Date(value < 1e12 ? value * 1000 : value) // epoch s | ms
    if (typeof value === 'string') {
      const parsed = new Date(value)
      if (!Number.isNaN(parsed.getTime())) return parsed
    }
    return fallback
  }

  protected defaultUnit(metric: string): string | undefined {
    return DEFAULT_UNITS[metric as KnownMetric]
  }

  protected isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
  }
}
