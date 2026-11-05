import type { ReportQueryDto, ReportSummaryDto } from '../dtos/index.js'
import { BadRequestException } from '../exceptions/index.js'
import type { IReportRepository } from '../interfaces/repositories/index.js'
import type { IReportService } from '../interfaces/services/index.js'
import { addDays, toDate } from '../utils/index.js'

const sum = <T>(rows: T[], pick: (row: T) => number) => Number(rows.reduce((acc, row) => acc + pick(row), 0).toFixed(2))

export class ReportService implements IReportService {
  constructor(private readonly reports: IReportRepository) {}

  /** Resumen estadístico del periodo (por defecto, los últimos 6 meses). */
  async summary(query: ReportQueryDto): Promise<ReportSummaryDto> {
    const to = toDate(query.to) ?? new Date()
    const from = toDate(query.from) ?? addDays(to, -183)
    if (from > to) throw new BadRequestException('La fecha inicial no puede ser posterior a la final')

    const range = { from, to }
    const [harvestByMonth, distributionByMonth, harvestBySpecies, distributedBySpecies, cropsByStatus, fieldLogsByType, plots, fieldLogs] =
      await Promise.all([
        this.reports.harvestByMonth(range),
        this.reports.distributionByMonth(range),
        this.reports.harvestBySpecies(range),
        this.reports.distributedBySpecies(range),
        this.reports.cropsByStatus(),
        this.reports.fieldLogsByType(range),
        this.reports.plots(range),
        this.reports.countFieldLogs(range),
      ])

    return {
      period: range,
      totals: {
        harvestedKg: sum(harvestByMonth, (r) => r.kg),
        harvests: sum(harvestByMonth, (r) => r.count),
        distributedKg: sum(distributionByMonth, (r) => r.kg),
        distributions: sum(distributionByMonth, (r) => r.count),
        beneficiaries: sum(distributionByMonth, (r) => r.beneficiaries),
        fieldLogs,
      },
      harvestByMonth,
      distributionByMonth,
      harvestBySpecies,
      distributedBySpecies,
      cropsByStatus,
      fieldLogsByType,
      plots,
    }
  }
}
