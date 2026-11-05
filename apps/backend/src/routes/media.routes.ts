import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { controllers } from '../container.js'
import { ROLE_GROUPS } from '../constants/roles.js'
import {
  IdParamDto,
  MediaListResponseDto,
  MediaQueryDto,
  MediaResponseDto,
  UpdateMediaDto,
  errorResponses,
} from '../dtos/index.js'
import { authenticate, authorize } from '../middlewares/index.js'

export const mediaRoutes: FastifyPluginAsyncTypebox = async (app) => {
  const ctrl = controllers.media
  const tags = ['Evidencias']
  const security = [{ cookieAuth: [] }]

  app.addHook('preHandler', authenticate)

  app.get('/', {
    schema: {
      tags,
      security,
      summary: 'Listar evidencias (fotos)',
      querystring: MediaQueryDto,
      response: { 200: MediaListResponseDto },
    },
    handler: ctrl.list,
  })

  app.post('/', {
    preHandler: [authorize(...ROLE_GROUPS.FIELD_TEAM)],
    config: { rateLimit: { max: 30, timeWindow: '1 minute' } },
    schema: {
      tags,
      security,
      summary: 'Subir foto de evidencia',
      description:
        '`multipart/form-data`. Campos de texto opcionales **antes** del archivo: `caption`, `plotId`, `cropId`, ' +
        '`distributionId`, `takenAt` (ISO), `isPublic` (true/false). Al final, el archivo en el campo `file` ' +
        '(JPG, PNG o WEBP; tamaño máximo según UPLOAD_MAX_MB). Debe asociarse al menos a un predio, cultivo o jornada.',
      consumes: ['multipart/form-data'],
      response: { 201: MediaResponseDto, 400: errorResponses[400], 404: errorResponses[404] },
    },
    handler: ctrl.upload,
  })

  app.patch('/:id', {
    schema: {
      tags,
      security,
      summary: 'Editar descripción / visibilidad pública',
      params: IdParamDto,
      body: UpdateMediaDto,
      response: { 200: MediaResponseDto, 403: errorResponses[403], 404: errorResponses[404] },
    },
    handler: ctrl.update,
  })

  app.delete('/:id', {
    schema: {
      tags,
      security,
      summary: 'Eliminar evidencia (autor o administrador)',
      params: IdParamDto,
      response: { 204: { type: 'null', description: 'Eliminado' }, 403: errorResponses[403], 404: errorResponses[404] },
    },
    handler: ctrl.remove,
  })
}
