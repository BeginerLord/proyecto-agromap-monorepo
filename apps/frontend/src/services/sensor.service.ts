import { sensorsApi } from '@/api'
import type { DevicePayload, PaginationQuery, SensorReading } from '@/models'

export interface MetricSnapshot {
  metric: string
  latest: SensorReading
  series: number[]
}

export const sensorService = {
  providers: () => sensorsApi.providers(),
  listDevices: (query: PaginationQuery) => sensorsApi.listDevices(query),
  createDevice: (payload: DevicePayload) => sensorsApi.createDevice(payload),
  removeDevice: (id: string) => sensorsApi.removeDevice(id),
  sync: (id: string) => sensorsApi.sync(id),

  /** Agrupa las lecturas por métrica: último valor + serie (antiguo → reciente) para sparkline. */
  async snapshot(deviceId: string): Promise<MetricSnapshot[]> {
    const { data } = await sensorsApi.readings(deviceId, { limit: 100 })
    const groups = new Map<string, SensorReading[]>()
    for (const reading of data) groups.set(reading.metric, [...(groups.get(reading.metric) ?? []), reading])
    return [...groups].map(([metric, readings]) => ({
      metric,
      latest: readings[0]!,
      series: readings.slice(0, 24).map((r) => r.value).reverse(),
    }))
  },
}
