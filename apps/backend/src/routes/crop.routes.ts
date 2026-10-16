import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { controllers } from '../container.js'
import { ROLE_GROUPS } from '../constants/roles.js'
import {
  CreateCropDto,
  CropListResponseDto,
  CropQueryDto,
  CropResponseDto,
  IdParamDto,
  UpdateCropDto,
  errorResponses,
} from '../dtos/index.js'
import { authenticate, authorize } from '../middlewares/index.js'

export const cropRoutes: FastifyPluginAsyncTypebox = async (app) => {
  const ctrl = controllers.crops
  const tags = ['Cultivos']
  const security = [{ cookieAuth: [] }]

  app.addHook('preHandler', authenticate)

  app.get('/', {
    schema: { tags, security, summary: 'Listar cultivos', querystring: CropQueryDto, response: { 200: CropListResponseDto } },
    handler: ctrl.list,
  })

  app.get('/:id', {
    schema: {
      tags,
      security,
      summary: 'Obtener cultivo',
      params: IdParamDto,
      response: { 200: CropResponseDto, 404: errorResponses[404] },
    },
    handler: ctrl.getById,
  })

  app.post('/', {
    preHandler: [authorize(...ROLE_GROUPS.FIELD_TEAM)],
    schema: {
      tags,
      security,
      summary: 'Registrar cultivo',
      description: 'Si se envía `plantedAt` y `cycleDays`, la fecha estimada de cosecha se calcula automáticamente.',
      body: CreateCropDto,
      response: { 201: CropResponseDto, 400: errorResponses[400], 404: errorResponses[404] },
    },
    handler: ctrl.create,
  })

  app.patch('/:id', {
    preHandler: [authorize(...ROLE_GROUPS.FIELD_TEAM)],
    schema: {
      tags,
      security,
      summary: 'Actualizar cultivo / estado',
      params: IdParamDto,
      body: UpdateCropDto,
      response: { 200: CropResponseDto, 404: errorResponses[404] },
    },
    handler: ctrl.update,
  })

  app.delete('/:id', {
    preHandler: [authorize(...ROLE_GROUPS.MANAGERS)],
    schema: {
      tags,
      security,
      summary: 'Eliminar cultivo (solo sin cosechas)',
      params: IdParamDto,
      response: { 204: { type: 'null', description: 'Eliminado' }, 404: errorResponses[404], 409: errorResponses[409] },
    },
    handler: ctrl.remove,
  })
}
