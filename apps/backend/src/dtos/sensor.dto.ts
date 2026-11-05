import Type, { type Static } from 'typebox'
import { DEVICE_STATUS } from '../constants/domain.js'
import {
  CropRefDto,
  DateTime,
  DateTimeInput,
  ObjectId,
  Paginated,
  PaginationQueryDto,
  PlotRefDto,
  StringEnum,
  TimestampsDto,
} from './common.dto.js'

const ThresholdsDto = Type.Record(
  Type.String(),
  Type.Object({ min: Type.Optional(Type.Number()), max: Type.Optional(Type.Number()) }, { additionalProperties: false }),
  { description: 'Rango normal por métrica, p. ej. { "soil_moisture": { "min": 30, "max": 80 } }' },
)

export const CreateDeviceDto = Type.Object(
  {
    name: Type.String({ minLength: 2, maxLength: 120 }),
    provider: Type.Optional(Type.String({ description: 'Clave del adapter. Por defecto SENSOR_DEFAULT_PROVIDER' })),
    externalId: Type.String({ minLength: 1, maxLength: 120, description: 'Identificador del dispositivo en el proveedor' }),
    kind: Type.Optional(Type.String({ maxLength: 60, examples: ['soil-probe', 'weather-station'] })),
    metrics: Type.Optional(Type.Array(Type.String(), { examples: [['soil_moisture', 'temperature']] })),
    plotId: Type.Optional(ObjectId),
    cropId: Type.Optional(ObjectId),
    status: Type.Optional(StringEnum(DEVICE_STATUS)),
    metadata: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
    thresholds: Type.Optional(ThresholdsDto),
  },
  { additionalProperties: false },
)
export type CreateDeviceDto = Static<typeof CreateDeviceDto>

export const UpdateDeviceDto = Type.Partial(CreateDeviceDto, { additionalProperties: false, minProperties: 1 })
export type UpdateDeviceDto = Static<typeof UpdateDeviceDto>

export const DeviceResponseDto = Type.Object({
  id: Type.String(),
  name: Type.String(),
  provider: Type.String(),
  externalId: Type.String(),
  kind: Type.Optional(Type.String()),
  metrics: Type.Array(Type.String()),
  plot: Type.Optional(PlotRefDto),
  crop: Type.Optional(CropRefDto),
  status: StringEnum(DEVICE_STATUS),
  lastSeenAt: Type.Optional(DateTime),
  metadata: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
  thresholds: Type.Optional(ThresholdsDto),
  ...TimestampsDto,
})
export const DeviceListResponseDto = Paginated(DeviceResponseDto)

export const ReadingQueryDto = Type.Object({
  ...PaginationQueryDto.properties,
  metric: Type.Optional(Type.String()),
  from: Type.Optional(DateTimeInput),
  to: Type.Optional(DateTimeInput),
})
export type ReadingQueryDto = Static<typeof ReadingQueryDto>

export const SensorReadingResponseDto = Type.Object({
  id: Type.String(),
  device: Type.String(),
  plot: Type.Optional(Type.String()),
  metric: Type.String(),
  value: Type.Number(),
  unit: Type.Optional(Type.String()),
  recordedAt: DateTime,
  createdAt: DateTime,
})
export const ReadingListResponseDto = Paginated(SensorReadingResponseDto)

export const ProviderParamDto = Type.Object({ provider: Type.String() })
export type ProviderParamDto = Static<typeof ProviderParamDto>

/** El cuerpo de ingesta es libre: cada adapter sabe cómo normalizar el payload de su proveedor. */
export const IngestBodyDto = Type.Unknown({ description: 'Payload crudo del proveedor/gateway' })

export const IngestResultDto = Type.Object({
  provider: Type.String(),
  received: Type.Integer(),
  stored: Type.Integer(),
  skipped: Type.Integer(),
  alerts: Type.Integer({ description: 'Alertas registradas en la bitácora por lecturas fuera de rango' }),
})
export type IngestResultDto = Static<typeof IngestResultDto>

export const ProviderInfoDto = Type.Object({
  key: Type.String(),
  displayName: Type.String(),
  configured: Type.Boolean(),
  isDefault: Type.Boolean(),
})
export const ProviderListDto = Type.Object({
  enabled: Type.Boolean(),
  alertsEnabled: Type.Boolean(),
  defaultThresholds: ThresholdsDto,
  providers: Type.Array(ProviderInfoDto),
})
