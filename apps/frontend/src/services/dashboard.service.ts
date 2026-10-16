import { dashboardApi } from '@/api'

export const dashboardService = {
  summary: (horizonDays?: number) => dashboardApi.summary(horizonDays),
}
