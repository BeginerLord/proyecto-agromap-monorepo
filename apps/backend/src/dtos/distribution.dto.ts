import Type, { type Static } from 'typebox'
import { DateTime, DateTimeInput, ObjectId, Paginated, PaginationQueryDto, TimestampsDto, UserRefDto } from './common.dto.js'

export const CreateDistributionDto = Type.Object(
  {
    date: DateTimeInput,
    title: Type.Optional(Type.String({ maxLength: 120 })),
    items: Type.Array(
      Type.Object({ harvestId: ObjectId, quantityKg: Type.Number({ exclusiveMinimum: 0 }) }, { additionalProperties: false }),
      { minItems: 1, maxItems: 50 },
    ),
    beneficiaries: Type.Integer({ minimum: 0 }),
    notes: Type.Optional(Type.String({ maxLength: 1000 })),
  },
  { additionalProperties: false },
)
export type CreateDistributionDto = Static<typeof CreateDistributionDto>

export const DistributionQueryDto = Type.Object({
  ...PaginationQueryDto.properties,
  from: Type.Optional(DateTimeInput),
  to: Type.Optional(DateTimeInput),
})
export type DistributionQueryDto = Static<typeof DistributionQueryDto>

export const DistributionResponseDto = Type.Object({
  id: Type.String(),
  date: DateTime,
  title: Type.String(),
  items: Type.Array(Type.Object({ harvest: Type.String(), species: Type.String(), quantityKg: Type.Number() })),
  totalKg: Type.Number(),
  beneficiaries: Type.Integer(),
  notes: Type.Optional(Type.String()),
  createdBy: UserRefDto,
  ...TimestampsDto,
})

export const DistributionListResponseDto = Paginated(DistributionResponseDto)
