import type { ISODate } from './common.model'

export interface ReportQuery {
  from?: ISODate
  to?: ISODate
}

export interface ReportSummary {
  period: { from: ISODate; to: ISODate }
  totals: {
    harvestedKg: number
    harvests: number
    distributedKg: number
    distributions: number
    beneficiaries: number
    fieldLogs: number
  }
  harvestByMonth: { month: string; kg: number; count: number }[]
  distributionByMonth: { month: string; kg: number; beneficiaries: number; count: number }[]
  harvestBySpecies: { species: string; kg: number }[]
  distributedBySpecies: { species: string; kg: number }[]
  cropsByStatus: { key: string; count: number }[]
  fieldLogsByType: { key: string; count: number }[]
  plots: {
    plotId: string
    plot: string
    district: string
    crops: number
    activeCrops: number
    harvestedKg: number
  }[]
}
