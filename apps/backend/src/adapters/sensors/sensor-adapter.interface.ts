import type {
  AdapterHealth,
  ExternalDevice,
  FetchReadingsOptions,
  NormalizedReading,
} from './sensor.types.js'

/**
 * Target del patrón Adapter.
 *
 * La aplicación (SensorService) solo conoce esta interfaz. Cada proveedor de sensores
 * (LoRaWAN, MQTT, API REST de un fabricante, gateway propio, etc.) se integra creando
 * una clase que la implemente y registrándola en `sensor-adapter.registry.ts`.
 *
 * Dos modos de integración soportados:
 *  - PULL: la API consulta al proveedor → `fetchReadings()`
 *  - PUSH: el proveedor/gateway envía datos a `POST /sensors/ingest/:provider` → `normalize()`
 */
export interface ISensorAdapter {
  /** Clave única del proveedor (se guarda en Device.provider). */
  readonly key: string
  /** Nombre legible para la UI. */
  readonly displayName: string

  /** Indica si el adapter tiene la configuración necesaria (.env) para operar. */
  isConfigured(): boolean

  /** Abre recursos (conexiones MQTT, sockets, clientes HTTP...). Idempotente. */
  connect(): Promise<void>
  /** Libera recursos. Se llama al apagar el servidor. */
  disconnect(): Promise<void>

  healthCheck(): Promise<AdapterHealth>

  /** Descubrimiento de dispositivos (opcional según el proveedor). */
  listDevices(): Promise<ExternalDevice[]>

  /** Modo PULL: obtiene lecturas de un dispositivo desde el proveedor. */
  fetchReadings(externalDeviceId: string, options?: FetchReadingsOptions): Promise<NormalizedReading[]>

  /** Modo PUSH: traduce un payload crudo del proveedor a lecturas normalizadas. */
  normalize(payload: unknown): NormalizedReading[]
}
