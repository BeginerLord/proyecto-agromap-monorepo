import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { controllers } from '../container.js'
import { ROLE_GROUPS } from '../constants/roles.js'
import {
  CreateHarvestDto,
  HarvestListResponseDto,
  HarvestQueryDto,
  HarvestResponseDto,
  IdParamDto,
  errorResponses,
} from '../dtos/index.js'
import { authenticate, authorize } from '../middlewares/index.js'

export const harvestRoutes: FastifyPluginAsyncTypebox = async (app) => {
  const ctrl = controllers.harvests
  const tags = ['Cosechas']
  const security = [{ cookieAuth: [] }]

  app.addHook('preHandler', authenticate)

  app.get('/', {
    schema: {
      tags,
      security,
      summary: 'Listar cosechas',
      querystring: HarvestQueryDto,
      response: { 200: HarvestListResponseDto },
    },
    handler: ctrl.list,
  })

  app.get('/:id', {
    schema: {
      tags,
      security,
      summary: 'Obtener cosecha',
      params: IdParamDto,
      response: { 200: HarvestResponseDto, 404: errorResponses[404] },
    },
    handler: ctrl.getById,
  })

  app.post('/', {
    preHandler: [authorize(...ROLE_GROUPS.FIELD_TEAM)],
    schema: {
      tags,
      security,
      summary: 'Registrar cosecha',
      description: 'Los kilos quedan disponibles para las jornadas de apoyo.',
      body: CreateHarvestDto,
      response: { 201: HarvestResponseDto, 404: errorResponses[404] },
    },
    handler: ctrl.create,
  })

  app.delete('/:id', {
    preHandler: [authorize(...ROLE_GROUPS.MANAGERS)],
    schema: {
      tags,
      security,
      summary: 'Eliminar cosecha (si no ha sido distribuida)',
      params: IdParamDto,
      response: { 204: { type: 'null', description: 'Eliminado' }, 404: errorResponses[404], 409: errorResponses[409] },
    },
    handler: ctrl.remove,
  })
}
