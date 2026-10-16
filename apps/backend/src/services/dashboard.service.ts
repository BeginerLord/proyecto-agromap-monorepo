import type { DashboardSummaryDto } from '../dtos/index.js'
import type {
  ICropRepository,
  IDistributionRepository,
  IFieldLogRepository,
  IHarvestRepository,
  IPlotRepository,
} from '../interfaces/repositories/index.js'
import type { IDashboardService } from '../interfaces/services/index.js'
import { addDays } from '../utils/index.js'

export class DashboardService implements IDashboardService {
  constructor(
    private readonly plots: IPlotRepository,
    private readonly crops: ICropRepository,
    private readonly harvests: IHarvestRepository,
    private readonly distributions: IDistributionRepository,
    private readonly logs: IFieldLogRepository,
  ) {}

  async summary(horizonDays: number): Promise<DashboardSummaryDto> {
    const now = new Date()
    const [plots, byStatus, harvest, distributions, upcoming, recentLogs] = await Promise.all([
      this.plots.count({ status: 'active' }),
      this.crops.countByStatus(),
      this.harvests.totals(),
      this.distributions.totals(),
      this.crops.findUpcomingHarvests(addDays(now, -7), addDays(now, horizonDays), 8),
      this.logs.findRecent(6),
    ])

    const counts = byStatus as Record<string, number>
    return {
      plots,
      crops: { total: Object.values(counts).reduce((a, b) => a + b, 0), byStatus: counts },
      harvest,
      distributions,
      // El DTO de respuesta serializa las fechas; las entidades usan Date
      upcomingHarvests: upcoming as unknown as DashboardSummaryDto['upcomingHarvests'],
      recentLogs: recentLogs as unknown as DashboardSummaryDto['recentLogs'],
    }
  }
}
