/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  PLANTILLA PARA UN NUEVO PROVEEDOR DE SENSORES
 * ─────────────────────────────────────────────────────────────────────────────
 *  1. Copia este archivo como `<proveedor>.adapter.ts` (p. ej. `ttn.adapter.ts`).
 *  2. Cambia `key` y `displayName`.
 *  3. Implementa `fetchReadings()` (PULL) y/o `normalize()` (PUSH).
 *  4. Regístralo en `sensor-adapter.registry.ts` → `createDefaultRegistry()`.
 *  5. Agrega sus variables al `.env` / `.env.example` y a `config/env.ts`.
 *
 *  Este archivo NO se registra; existe solo como referencia.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { BaseSensorAdapter } from '../base-sensor.adapter.js'
import type { FetchReadingsOptions, NormalizedReading } from '../sensor.types.js'

export class TemplateSensorAdapter extends BaseSensorAdapter {
  readonly key = 'template'
  readonly displayName = 'Proveedor de ejemplo'

  override isConfigured(): boolean {
    return false // TODO: validar credenciales/URL del proveedor
  }

  override async connect(): Promise<void> {
    // TODO: abrir conexión (cliente MQTT, websocket, SDK del fabricante...)
    await super.connect()
  }

  override async disconnect(): Promise<void> {
    // TODO: cerrar conexión
    await super.disconnect()
  }

  async fetchReadings(_externalDeviceId: string, _options?: FetchReadingsOptions): Promise<NormalizedReading[]> {
    // TODO: consultar al proveedor y mapear con this.normalize(...)
    return []
  }

  normalize(_payload: unknown): NormalizedReading[] {
    // TODO: traducir el payload del proveedor → NormalizedReading[]
    return []
  }
}
