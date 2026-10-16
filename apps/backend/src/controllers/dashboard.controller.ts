import type { FastifyRequest } from 'fastify'
import type { DashboardQueryDto } from '../dtos/index.js'
import type { IDashboardService } from '../interfaces/services/index.js'

export class DashboardController {
  constructor(private readonly dashboard: IDashboardService) {}

  summary = (request: FastifyRequest<{ Querystring: DashboardQueryDto }>) =>
    this.dashboard.summary(request.query.horizonDays ?? 45)
}
