import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { controllers } from '../container.js'
import {
  CreateFieldLogDto,
  FieldLogListResponseDto,
  FieldLogQueryDto,
  FieldLogResponseDto,
  IdParamDto,
  UpdateFieldLogDto,
  errorResponses,
} from '../dtos/index.js'
import { authenticate } from '../middlewares/index.js'

export const fieldLogRoutes: FastifyPluginAsyncTypebox = async (app) => {
  const ctrl = controllers.fieldLogs
  const tags = ['Bitácora']
  const security = [{ cookieAuth: [] }]

  app.addHook('preHandler', authenticate)

  app.get('/', {
    schema: {
      tags,
      security,
      summary: 'Listar registros de bitácora',
      querystring: FieldLogQueryDto,
      response: { 200: FieldLogListResponseDto },
    },
    handler: ctrl.list,
  })

  app.get('/:id', {
    schema: {
      tags,
      security,
      summary: 'Obtener registro',
      params: IdParamDto,
      response: { 200: FieldLogResponseDto, 404: errorResponses[404] },
    },
    handler: ctrl.getById,
  })

  app.post('/', {
    schema: {
      tags,
      security,
      summary: 'Agregar registro a la bitácora de un cultivo',
      body: CreateFieldLogDto,
      response: { 201: FieldLogResponseDto, 404: errorResponses[404] },
    },
    handler: ctrl.create,
  })

  app.patch('/:id', {
    schema: {
      tags,
      security,
      summary: 'Editar registro (autor o admin)',
      params: IdParamDto,
      body: UpdateFieldLogDto,
      response: { 200: FieldLogResponseDto, 403: errorResponses[403], 404: errorResponses[404] },
    },
    handler: ctrl.update,
  })

  app.delete('/:id', {
    schema: {
      tags,
      security,
      summary: 'Eliminar registro (autor o admin)',
      params: IdParamDto,
      response: { 204: { type: 'null', description: 'Eliminado' }, 403: errorResponses[403], 404: errorResponses[404] },
    },
    handler: ctrl.remove,
  })
}
