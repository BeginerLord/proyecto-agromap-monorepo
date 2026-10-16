import Type, { type Static } from 'typebox'
import { HARVEST_QUALITY } from '../constants/domain.js'
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
  UserRefDto,
} from './common.dto.js'

export const HarvestQualityDto = StringEnum(HARVEST_QUALITY)

export const CreateHarvestDto = Type.Object(
  {
    cropId: ObjectId,
    harvestedAt: Type.Optional(DateTimeInput),
    quantityKg: Type.Number({ exclusiveMinimum: 0 }),
    quality: Type.Optional(HarvestQualityDto),
    notes: Type.Optional(Type.String({ maxLength: 1000 })),
  },
  { additionalProperties: false },
)
export type CreateHarvestDto = Static<typeof CreateHarvestDto>

export const HarvestQueryDto = Type.Object({
  ...PaginationQueryDto.properties,
  cropId: Type.Optional(ObjectId),
  plotId: Type.Optional(ObjectId),
  onlyAvailable: Type.Optional(Type.Boolean()),
})
export type HarvestQueryDto = Static<typeof HarvestQueryDto>

export const HarvestResponseDto = Type.Object({
  id: Type.String(),
  crop: CropRefDto,
  plot: PlotRefDto,
  harvestedAt: DateTime,
  quantityKg: Type.Number(),
  availableKg: Type.Number(),
  quality: HarvestQualityDto,
  notes: Type.Optional(Type.String()),
  registeredBy: UserRefDto,
  ...TimestampsDto,
})

export const HarvestListResponseDto = Paginated(HarvestResponseDto)
