import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { controllers } from '../container.js'
import { ROLE_GROUPS } from '../constants/roles.js'
import {
  CreateDistributionDto,
  DistributionListResponseDto,
  DistributionQueryDto,
  DistributionResponseDto,
  ErrorResponseDto,
  IdParamDto,
  errorResponses,
} from '../dtos/index.js'
import { authenticate, authorize } from '../middlewares/index.js'

export const distributionRoutes: FastifyPluginAsyncTypebox = async (app) => {
  const ctrl = controllers.distributions
  const tags = ['Jornadas de apoyo']
  const security = [{ cookieAuth: [] }]

  app.addHook('preHandler', authenticate)

  app.get('/', {
    schema: {
      tags,
      security,
      summary: 'Listar jornadas de apoyo alimentario',
      querystring: DistributionQueryDto,
      response: { 200: DistributionListResponseDto },
    },
    handler: ctrl.list,
  })

  app.get('/:id', {
    schema: {
      tags,
      security,
      summary: 'Obtener entrega',
      params: IdParamDto,
      response: { 200: DistributionResponseDto, 404: errorResponses[404] },
    },
    handler: ctrl.getById,
  })

  app.post('/', {
    preHandler: [authorize(...ROLE_GROUPS.MANAGERS)],
    schema: {
      tags,
      security,
      summary: 'Registrar entrega de alimentos',
      description: 'Descuenta los kilos de cada cosecha incluida. Falla con 422 si no hay stock suficiente.',
      body: CreateDistributionDto,
      response: { 201: DistributionResponseDto, 404: errorResponses[404], 422: ErrorResponseDto },
    },
    handler: ctrl.create,
  })
}
