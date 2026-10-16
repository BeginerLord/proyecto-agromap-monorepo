import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import Type from 'typebox'
import { authRoutes } from './auth.routes.js'
import { cropRoutes } from './crop.routes.js'
import { dashboardRoutes } from './dashboard.routes.js'
import { distributionRoutes } from './distribution.routes.js'
import { fieldLogRoutes } from './field-log.routes.js'
import { harvestRoutes } from './harvest.routes.js'
import { plotRoutes } from './plot.routes.js'
import { sensorRoutes } from './sensor.routes.js'
import { userRoutes } from './user.routes.js'

/** Router principal: monta cada módulo bajo su prefijo. */
export const apiRoutes: FastifyPluginAsyncTypebox = async (app) => {
  app.get('/health', {
    schema: {
      tags: ['Sistema'],
      summary: 'Estado de la API',
      response: { 200: Type.Object({ status: Type.String(), uptime: Type.Number(), timestamp: Type.String() }) },
    },
    handler: async () => ({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() }),
  })

  await app.register(authRoutes, { prefix: '/auth' })
  await app.register(userRoutes, { prefix: '/users' })
  await app.register(dashboardRoutes, { prefix: '/dashboard' })
  await app.register(plotRoutes, { prefix: '/plots' })
  await app.register(cropRoutes, { prefix: '/crops' })
  await app.register(fieldLogRoutes, { prefix: '/field-logs' })
  await app.register(harvestRoutes, { prefix: '/harvests' })
  await app.register(distributionRoutes, { prefix: '/distributions' })
  await app.register(sensorRoutes, { prefix: '/sensors' })
}
