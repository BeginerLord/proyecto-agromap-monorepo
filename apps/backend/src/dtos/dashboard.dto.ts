import Type, { type Static } from 'typebox'
import { CropResponseDto } from './crop.dto.js'
import { FieldLogResponseDto } from './field-log.dto.js'

export const DashboardQueryDto = Type.Object({
  horizonDays: Type.Optional(Type.Integer({ minimum: 1, maximum: 180, default: 45 })),
})
export type DashboardQueryDto = Static<typeof DashboardQueryDto>

export const DashboardSummaryDto = Type.Object({
  plots: Type.Integer(),
  crops: Type.Object({
    total: Type.Integer(),
    byStatus: Type.Record(Type.String(), Type.Integer()),
  }),
  harvest: Type.Object({ harvestedKg: Type.Number(), availableKg: Type.Number() }),
  distributions: Type.Object({
    count: Type.Integer(),
    distributedKg: Type.Number(),
    beneficiaries: Type.Integer(),
  }),
  upcomingHarvests: Type.Array(CropResponseDto, { description: 'Cultivos con cosecha estimada en el horizonte' }),
  recentLogs: Type.Array(FieldLogResponseDto),
})
export type DashboardSummaryDto = Static<typeof DashboardSummaryDto>
