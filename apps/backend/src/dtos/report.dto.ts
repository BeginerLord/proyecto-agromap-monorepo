import Type, { type Static } from 'typebox'
import { DateTime, DateTimeInput } from './common.dto.js'

export const ReportQueryDto = Type.Object({
  from: Type.Optional(DateTimeInput),
  to: Type.Optional(DateTimeInput),
})
export type ReportQueryDto = Static<typeof ReportQueryDto>

const MonthKg = Type.Object({ month: Type.String({ description: 'yyyy-mm' }), kg: Type.Number(), count: Type.Integer() })
const MonthDistribution = Type.Object({
  month: Type.String(),
  kg: Type.Number(),
  beneficiaries: Type.Integer(),
  count: Type.Integer(),
})
const SpeciesKg = Type.Object({ species: Type.String(), kg: Type.Number() })
const KeyCount = Type.Object({ key: Type.String(), count: Type.Integer() })
const PlotRow = Type.Object({
  plotId: Type.String(),
  plot: Type.String(),
  district: Type.String(),
  crops: Type.Integer(),
  activeCrops: Type.Integer(),
  harvestedKg: Type.Number(),
})

/** Estadísticas agregadas para el módulo de reportes. */
export const ReportSummaryDto = Type.Object({
  period: Type.Object({ from: DateTime, to: DateTime }),
  totals: Type.Object({
    harvestedKg: Type.Number(),
    harvests: Type.Integer(),
    distributedKg: Type.Number(),
    distributions: Type.Integer(),
    beneficiaries: Type.Integer(),
    fieldLogs: Type.Integer(),
  }),
  harvestByMonth: Type.Array(MonthKg),
  distributionByMonth: Type.Array(MonthDistribution),
  harvestBySpecies: Type.Array(SpeciesKg),
  distributedBySpecies: Type.Array(SpeciesKg),
  cropsByStatus: Type.Array(KeyCount),
  fieldLogsByType: Type.Array(KeyCount),
  plots: Type.Array(PlotRow),
})
export type ReportSummaryDto = Static<typeof ReportSummaryDto>
