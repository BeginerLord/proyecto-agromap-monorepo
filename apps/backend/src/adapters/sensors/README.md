# Módulo de sensores — Patrón Adapter

Los dispositivos de campo y el formato de sus datos **aún no están definidos**. Este módulo deja lista
la integración para que, cuando exista el hardware, solo haya que escribir **un adapter** sin tocar
servicios, controladores ni el frontend.

```
          SensorService (cliente)
                  │  depende solo de
                  ▼
         ISensorAdapter (target)  ◄── sensor-adapter.interface.ts
           ▲        ▲        ▲
           │        │        │
   MockSensor   HttpSensor   <TuProveedor>Adapter   (adaptees envueltos)
   Adapter      Adapter       (LoRaWAN, MQTT, SDK del fabricante...)
```

| Archivo | Rol |
| --- | --- |
| `sensor.types.ts` | Tipos neutrales: `NormalizedReading`, `ExternalDevice`, métricas sugeridas y unidades. |
| `sensor-adapter.interface.ts` | Contrato `ISensorAdapter` que toda integración debe cumplir. |
| `base-sensor.adapter.ts` | Clase base con helpers (`toNumber`, `toDate`, `defaultUnit`...). |
| `providers/mock.adapter.ts` | Simulador para desarrollo (genera lecturas realistas para Cereté). |
| `providers/http.adapter.ts` | Plantilla para proveedores con API REST (configurable por `.env`). |
| `providers/_template.adapter.ts` | Esqueleto para copiar al crear un proveedor nuevo. |
| `sensor-adapter.registry.ts` | Registro/fábrica: el único lugar donde se conectan los adapters. |

## Modos de integración

- **PULL** — la API consulta al proveedor: `POST /api/v1/sensors/devices/:id/sync` → `adapter.fetchReadings()`.
- **PUSH** — el gateway envía datos: `POST /api/v1/sensors/ingest/:provider` con header `x-sensor-key` → `adapter.normalize()`.

Ambos caminos terminan en lecturas normalizadas que se guardan en la colección `sensor_readings`
y actualizan `lastSeenAt` del dispositivo (colección `devices`). Las lecturas de dispositivos no
registrados se descartan (`skipped`).

## Agregar un proveedor real (checklist)

1. Copia `providers/_template.adapter.ts` → `providers/<proveedor>.adapter.ts`.
2. Define `key` (se guarda en `Device.provider`) y `displayName`.
3. Implementa `normalize(payload)` (PUSH) y/o `fetchReadings(id, options)` (PULL).
4. Agrega sus variables a `.env.example`, `.env` y `src/config/env.ts`.
5. Regístralo en `createDefaultRegistry()` dentro de `sensor-adapter.registry.ts`.
6. (Opcional) cambia `SENSOR_DEFAULT_PROVIDER=<key>` en `.env`.
7. Registra el dispositivo con `POST /api/v1/sensors/devices` usando su `externalId` del proveedor.

## Probar con el simulador

```bash
curl -X POST http://localhost:3000/api/v1/sensors/ingest/mock \
  -H "Content-Type: application/json" \
  -H "x-sensor-key: <SENSOR_INGEST_KEY>" \
  -d '{"deviceId":"mock-01","values":{"soil_moisture":41.2,"air_temperature":31}}'
```
