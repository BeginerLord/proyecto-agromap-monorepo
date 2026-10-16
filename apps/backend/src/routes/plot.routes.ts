import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { controllers } from '../container.js'
import { ROLES, ROLE_GROUPS } from '../constants/roles.js'
import {
  CreatePlotDto,
  IdParamDto,
  PlotListResponseDto,
  PlotQueryDto,
  PlotResponseDto,
  UpdatePlotDto,
  errorResponses,
} from '../dtos/index.js'
import { authenticate, authorize } from '../middlewares/index.js'

export const plotRoutes: FastifyPluginAsyncTypebox = async (app) => {
  const ctrl = controllers.plots
  const tags = ['Predios']
  const security = [{ cookieAuth: [] }]

  app.addHook('preHandler', authenticate)

  app.get('/', {
    schema: {
      tags,
      security,
      summary: 'Listar predios',
      querystring: PlotQueryDto,
      response: { 200: PlotListResponseDto },
    },
    handler: ctrl.list,
  })

  app.get('/:id', {
    schema: {
      tags,
      security,
      summary: 'Obtener predio',
      params: IdParamDto,
      response: { 200: PlotResponseDto, 404: errorResponses[404] },
    },
    handler: ctrl.getById,
  })

  app.post('/', {
    preHandler: [authorize(...ROLE_GROUPS.MANAGERS)],
    schema: {
      tags,
      security,
      summary: 'Registrar predio georreferenciado',
      body: CreatePlotDto,
      response: { 201: PlotResponseDto, 400: errorResponses[400], 403: errorResponses[403] },
    },
    handler: ctrl.create,
  })

  app.patch('/:id', {
    preHandler: [authorize(...ROLE_GROUPS.MANAGERS)],
    schema: {
      tags,
      security,
      summary: 'Actualizar predio / caracterización',
      params: IdParamDto,
      body: UpdatePlotDto,
      response: { 200: PlotResponseDto, 404: errorResponses[404] },
    },
    handler: ctrl.update,
  })

  app.delete('/:id', {
    preHandler: [authorize(ROLES.ADMIN)],
    schema: {
      tags,
      security,
      summary: 'Eliminar predio (solo sin cultivos)',
      params: IdParamDto,
      response: { 204: { type: 'null', description: 'Eliminado' }, 404: errorResponses[404], 409: errorResponses[409] },
    },
    handler: ctrl.remove,
  })
}
