import type { FastifyRequest } from 'fastify'
import type { ReportQueryDto } from '../dtos/index.js'
import type { IReportService } from '../interfaces/services/index.js'

export class ReportController {
  constructor(private readonly reports: IReportService) {}

  summary = (request: FastifyRequest<{ Querystring: ReportQueryDto }>) => this.reports.summary(request.query)
}
