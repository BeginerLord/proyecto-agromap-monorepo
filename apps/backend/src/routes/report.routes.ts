import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { controllers } from '../container.js'
import { ReportQueryDto, ReportSummaryDto, errorResponses } from '../dtos/index.js'
import { authenticate } from '../middlewares/index.js'

export const reportRoutes: FastifyPluginAsyncTypebox = async (app) => {
  app.get('/summary', {
    preHandler: [authenticate],
    schema: {
      tags: ['Estadísticas y reportes'],
      security: [{ cookieAuth: [] }],
      summary: 'Estadísticas del periodo',
      description:
        'Producción y entregas por mes y por especie, estado de los cultivos, actividades de bitácora y ' +
        'resumen por predio. Sin `from`/`to` se usan los últimos 6 meses.',
      querystring: ReportQueryDto,
      response: { 200: ReportSummaryDto, 400: errorResponses[400] },
    },
    handler: controllers.reports.summary,
  })
}
