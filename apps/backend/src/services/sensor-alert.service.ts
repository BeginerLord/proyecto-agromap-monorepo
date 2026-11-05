import { env } from '../config/env.js'
import {
  DEFAULT_SENSOR_THRESHOLDS,
  SENSOR_METRIC_LABELS,
  type MetricThreshold,
} from '../constants/domain.js'
import type { Device } from '../interfaces/entities/index.js'
import type { CreateSensorReadingData, ICropRepository, IFieldLogRepository } from '../interfaces/repositories/index.js'
import type { ISensorAlertService } from '../interfaces/services/index.js'

const HOUR_MS = 3_600_000
const fmt = (value: number) => new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 }).format(value)

interface OutOfRange {
  reading: CreateSensorReadingData
  condition: 'low' | 'high'
  threshold: number
}

/**
 * Retroalimentación sensores → bitácora.
 * Revisa las lecturas recién guardadas y, si alguna sale del rango normal de su métrica,
 * registra una "Alerta de sensor" en la bitácora del cultivo del dispositivo.
 * Para no saturar la bitácora, la misma alerta (dispositivo + métrica + condición) no se
 * repite durante SENSOR_ALERT_COOLDOWN_HOURS.
 */
export class SensorAlertService implements ISensorAlertService {
  constructor(
    private readonly logs: IFieldLogRepository,
    private readonly crops: ICropRepository,
  ) {}

  thresholdsFor(device: Pick<Device, 'thresholds'>): Record<string, MetricThreshold> {
    return { ...DEFAULT_SENSOR_THRESHOLDS, ...(device.thresholds ?? {}) }
  }

  async evaluate(device: Device, readings: CreateSensorReadingData[]): Promise<number> {
    if (!env.sensors.alertsEnabled || !device.plot || readings.length === 0) return 0

    const findings = this.latestOutOfRange(readings, this.thresholdsFor(device))
    if (findings.length === 0) return 0

    const cropId = device.crop?.id ?? (await this.activeCropOf(device.plot.id))
    if (!cropId) return 0 // sin cultivo al cual asociar la alerta

    let created = 0
    for (const { reading, condition, threshold } of findings) {
      if (await this.inCooldown(device.id, reading.metric, condition)) continue

      const label = SENSOR_METRIC_LABELS[reading.metric] ?? reading.metric
      const unit = reading.unit ? ` ${reading.unit}` : ''
      const limit = condition === 'low' ? `mínimo ${fmt(threshold)}${unit}` : `máximo ${fmt(threshold)}${unit}`
      await this.logs.create({
        crop: cropId,
        plot: device.plot.id,
        date: reading.recordedAt,
        type: 'sensor_alert',
        source: 'sensor',
        description:
          `${label} ${condition === 'low' ? 'por debajo' : 'por encima'} del rango: ` +
          `${fmt(reading.value)}${unit} (${limit}). Registrado automáticamente por «${device.name}».`,
        photos: [],
        sensor: {
          device: device.id,
          deviceName: device.name,
          metric: reading.metric,
          value: reading.value,
          unit: reading.unit,
          condition,
          threshold,
          recordedAt: reading.recordedAt,
        },
      })
      created++
    }
    return created
  }

  /** Por cada métrica se evalúa solo la lectura más reciente (estado actual del campo). */
  private latestOutOfRange(readings: CreateSensorReadingData[], thresholds: Record<string, MetricThreshold>): OutOfRange[] {
    const latest = new Map<string, CreateSensorReadingData>()
    for (const reading of readings) {
      const current = latest.get(reading.metric)
      if (!current || reading.recordedAt > current.recordedAt) latest.set(reading.metric, reading)
    }

    const findings: OutOfRange[] = []
    for (const reading of latest.values()) {
      const range = thresholds[reading.metric]
      if (!range) continue
      if (range.min !== undefined && reading.value < range.min) findings.push({ reading, condition: 'low', threshold: range.min })
      else if (range.max !== undefined && reading.value > range.max) findings.push({ reading, condition: 'high', threshold: range.max })
    }
    return findings
  }

  private async activeCropOf(plotId: string): Promise<string | undefined> {
    const { items } = await this.crops.findMany({
      filter: { plot: plotId, status: { $in: ['planted', 'growing', 'harvesting'] } },
      page: 1,
      limit: 1,
      sort: { plantedAt: -1 },
    })
    return items[0]?.id
  }

  private inCooldown(deviceId: string, metric: string, condition: 'low' | 'high'): Promise<boolean> {
    return this.logs.exists({
      source: 'sensor',
      'sensor.device': deviceId,
      'sensor.metric': metric,
      'sensor.condition': condition,
      createdAt: { $gte: new Date(Date.now() - env.sensors.alertCooldownHours * HOUR_MS) },
    })
  }
}
