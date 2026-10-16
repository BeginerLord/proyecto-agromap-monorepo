import Type, { type Static } from 'typebox'
import { FIELD_LOG_TYPES } from '../constants/domain.js'
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

export const FieldLogTypeDto = StringEnum(FIELD_LOG_TYPES)

export const CreateFieldLogDto = Type.Object(
  {
    cropId: ObjectId,
    date: Type.Optional(DateTimeInput),
    type: FieldLogTypeDto,
    description: Type.String({ minLength: 3, maxLength: 2000 }),
    photos: Type.Optional(Type.Array(Type.String({ format: 'uri' }), { maxItems: 10 })),
  },
  { additionalProperties: false },
)
export type CreateFieldLogDto = Static<typeof CreateFieldLogDto>

export const UpdateFieldLogDto = Type.Partial(Type.Omit(CreateFieldLogDto, ['cropId']), {
  additionalProperties: false,
  minProperties: 1,
})
export type UpdateFieldLogDto = Static<typeof UpdateFieldLogDto>

export const FieldLogQueryDto = Type.Object({
  ...PaginationQueryDto.properties,
  cropId: Type.Optional(ObjectId),
  plotId: Type.Optional(ObjectId),
  type: Type.Optional(FieldLogTypeDto),
})
export type FieldLogQueryDto = Static<typeof FieldLogQueryDto>

export const FieldLogResponseDto = Type.Object({
  id: Type.String(),
  crop: CropRefDto,
  plot: PlotRefDto,
  date: DateTime,
  type: FieldLogTypeDto,
  description: Type.String(),
  photos: Type.Array(Type.String()),
  author: UserRefDto,
  ...TimestampsDto,
})

export const FieldLogListResponseDto = Paginated(FieldLogResponseDto)
