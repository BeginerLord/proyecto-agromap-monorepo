import type { Crop, CropStatus } from './crop.model'
import type { FieldLog } from './field-log.model'

export interface DashboardSummary {
  plots: number
  crops: { total: number; byStatus: Partial<Record<CropStatus, number>> }
  harvest: { harvestedKg: number; availableKg: number }
  distributions: { count: number; distributedKg: number; beneficiaries: number }
  upcomingHarvests: Crop[]
  recentLogs: FieldLog[]
}
