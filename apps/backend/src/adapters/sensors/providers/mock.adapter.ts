import { BaseSensorAdapter } from '../base-sensor.adapter.js'
import { KNOWN_METRICS, type FetchReadingsOptions, type NormalizedReading } from '../sensor.types.js'

/** Rango realista por métrica para un clima cálido (Cereté, Córdoba). */
const SIMULATION: Record<string, { min: number; max: number }> = {
  [KNOWN_METRICS.SOIL_MOISTURE]: { min: 25, max: 65 },
  [KNOWN_METRICS.SOIL_TEMPERATURE]: { min: 24, max: 33 },
  [KNOWN_METRICS.AIR_TEMPERATURE]: { min: 24, max: 36 },
  [KNOWN_METRICS.AIR_HUMIDITY]: { min: 55, max: 95 },
  [KNOWN_METRICS.SOIL_PH]: { min: 5.5, max: 7.2 },
  [KNOWN_METRICS.LIGHT]: { min: 2000, max: 90000 },
}

/**
 * Adapter de simulación. Permite desarrollar y probar el front/back mientras
 * los dispositivos reales no están disponibles.
 */
export class MockSensorAdapter extends BaseSensorAdapter {
  readonly key = 'mock'
  readonly displayName = 'Simulador (desarrollo)'

  async fetchReadings(externalDeviceId: string, options: FetchReadingsOptions = {}): Promise<NormalizedReading[]> {
    const metrics = options.metrics?.length ? options.metrics : Object.keys(SIMULATION)
    const samples = Math.min(options.limit ?? 6, 48)
    const now = Date.now()
    const stepMs = 30 * 60_000 // una lectura cada 30 minutos

    return metrics.flatMap((metric) => {
      const range = SIMULATION[metric] ?? { min: 0, max: 100 }
      return Array.from({ length: samples }, (_, index) => ({
        externalDeviceId,
        metric,
        value: Number((range.min + Math.random() * (range.max - range.min)).toFixed(2)),
        unit: this.defaultUnit(metric),
        recordedAt: new Date(now - (samples - 1 - index) * stepMs),
      }))
    })
  }

  /**
   * Formato de prueba para PUSH:
   * { "deviceId": "mock-01", "timestamp": "...", "values": { "soil_moisture": 41.2 } }
   */
  normalize(payload: unknown): NormalizedReading[] {
    const items = Array.isArray(payload) ? payload : [payload]
    return items.flatMap((item) => {
      if (!this.isRecord(item) || typeof item.deviceId !== 'string' || !this.isRecord(item.values)) return []
      const recordedAt = this.toDate(item.timestamp)
      return Object.entries(item.values).flatMap(([metric, raw]) => {
        const value = this.toNumber(raw)
        return value === null
          ? []
          : [{ externalDeviceId: item.deviceId as string, metric, value, unit: this.defaultUnit(metric), recordedAt, raw: item }]
      })
    })
  }
}
