import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { controllers } from '../container.js'
import { DashboardQueryDto, DashboardSummaryDto } from '../dtos/index.js'
import { authenticate } from '../middlewares/index.js'

export const dashboardRoutes: FastifyPluginAsyncTypebox = async (app) => {
  app.get('/summary', {
    preHandler: [authenticate],
    schema: {
      tags: ['Dashboard'],
      security: [{ cookieAuth: [] }],
      summary: 'Resumen general',
      description: 'Indicadores de predios, cultivos, cosechas, jornadas y próximas cosechas estimadas.',
      querystring: DashboardQueryDto,
      response: { 200: DashboardSummaryDto },
    },
    handler: controllers.dashboard.summary,
  })
}
