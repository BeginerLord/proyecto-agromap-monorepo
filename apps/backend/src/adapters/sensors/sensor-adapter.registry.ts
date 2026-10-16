import { env } from '../../config/env.js'
import type { ISensorAdapter } from './sensor-adapter.interface.js'
import { HttpSensorAdapter } from './providers/http.adapter.js'
import { MockSensorAdapter } from './providers/mock.adapter.js'

/**
 * Registro/fábrica de adapters. Desacopla al SensorService de las implementaciones:
 * el servicio pide un adapter por su clave y recibe un `ISensorAdapter`.
 */
export class SensorAdapterRegistry {
  private readonly adapters = new Map<string, ISensorAdapter>()

  constructor(private readonly defaultKey: string) {}

  register(adapter: ISensorAdapter): this {
    this.adapters.set(adapter.key, adapter)
    return this
  }

  has(key: string): boolean {
    return this.adapters.has(key)
  }

  get(key?: string): ISensorAdapter | undefined {
    return this.adapters.get(key ?? this.defaultKey)
  }

  get defaultProvider(): string {
    return this.defaultKey
  }

  list(): ISensorAdapter[] {
    return [...this.adapters.values()]
  }

  async connectAll(): Promise<void> {
    await Promise.all(this.list().filter((a) => a.isConfigured()).map((a) => a.connect()))
  }

  async disconnectAll(): Promise<void> {
    await Promise.allSettled(this.list().map((a) => a.disconnect()))
  }
}

/** Punto único donde se registran los proveedores disponibles. */
export function createDefaultRegistry(): SensorAdapterRegistry {
  return new SensorAdapterRegistry(env.sensors.defaultProvider)
    .register(new MockSensorAdapter())
    .register(new HttpSensorAdapter({ baseUrl: env.sensors.http.baseUrl, token: env.sensors.http.token }))
  // .register(new MiProveedorAdapter({...}))  ← agrega aquí los nuevos adapters
}
