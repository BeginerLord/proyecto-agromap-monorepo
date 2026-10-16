import Type, { type Static } from 'typebox'
import { CROP_STATUS } from '../constants/domain.js'
import {
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

export const CropStatusDto = StringEnum(CROP_STATUS)

export const CreateCropDto = Type.Object(
  {
    plotId: ObjectId,
    species: Type.String({ minLength: 2, maxLength: 80, examples: ['Ají', 'Pepino', 'Habichuela'] }),
    variety: Type.Optional(Type.String({ maxLength: 80 })),
    status: Type.Optional(CropStatusDto),
    plantedAt: Type.Optional(DateTimeInput),
    expectedHarvestAt: Type.Optional(DateTimeInput),
    cycleDays: Type.Optional(Type.Integer({ minimum: 1, maximum: 730 })),
    areaM2: Type.Optional(Type.Number({ minimum: 0 })),
    plantCount: Type.Optional(Type.Integer({ minimum: 0 })),
    notes: Type.Optional(Type.String({ maxLength: 1000 })),
  },
  { additionalProperties: false },
)
export type CreateCropDto = Static<typeof CreateCropDto>

export const UpdateCropDto = Type.Partial(Type.Omit(CreateCropDto, ['plotId']), {
  additionalProperties: false,
  minProperties: 1,
})
export type UpdateCropDto = Static<typeof UpdateCropDto>

export const CropQueryDto = Type.Object({
  ...PaginationQueryDto.properties,
  plotId: Type.Optional(ObjectId),
  status: Type.Optional(CropStatusDto),
})
export type CropQueryDto = Static<typeof CropQueryDto>

export const CropResponseDto = Type.Object({
  id: Type.String(),
  plot: PlotRefDto,
  species: Type.String(),
  variety: Type.Optional(Type.String()),
  status: CropStatusDto,
  plantedAt: Type.Optional(DateTime),
  expectedHarvestAt: Type.Optional(DateTime),
  cycleDays: Type.Optional(Type.Integer()),
  areaM2: Type.Optional(Type.Number()),
  plantCount: Type.Optional(Type.Integer()),
  notes: Type.Optional(Type.String()),
  createdBy: Type.Optional(UserRefDto),
  ...TimestampsDto,
})

export const CropListResponseDto = Paginated(CropResponseDto)
