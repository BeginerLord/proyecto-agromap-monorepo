import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { controllers } from '../container.js'
import { ROLE_GROUPS } from '../constants/roles.js'
import {
  CommentListResponseDto,
  CommentQueryDto,
  CommentResponseDto,
  CommentStatsDto,
  IdParamDto,
  ModerateCommentDto,
  errorResponses,
} from '../dtos/index.js'
import { authenticate, authorize } from '../middlewares/index.js'

/** Moderación de experiencias enviadas desde el sitio público. */
export const commentRoutes: FastifyPluginAsyncTypebox = async (app) => {
  const ctrl = controllers.comments
  const tags = ['Experiencias']
  const security = [{ cookieAuth: [] }]

  app.addHook('preHandler', authenticate)
  app.addHook('preHandler', authorize(...ROLE_GROUPS.MANAGERS))

  app.get('/', {
    schema: {
      tags,
      security,
      summary: 'Listar comentarios (todos los estados)',
      querystring: CommentQueryDto,
      response: { 200: CommentListResponseDto },
    },
    handler: ctrl.list,
  })

  app.get('/stats', {
    schema: { tags, security, summary: 'Conteo por estado', response: { 200: CommentStatsDto } },
    handler: ctrl.stats,
  })

  app.patch('/:id/status', {
    schema: {
      tags,
      security,
      summary: 'Aprobar o rechazar un comentario',
      params: IdParamDto,
      body: ModerateCommentDto,
      response: { 200: CommentResponseDto, 404: errorResponses[404] },
    },
    handler: ctrl.moderate,
  })

  app.delete('/:id', {
    schema: {
      tags,
      security,
      summary: 'Eliminar comentario',
      params: IdParamDto,
      response: { 204: { type: 'null', description: 'Eliminado' }, 404: errorResponses[404] },
    },
    handler: ctrl.remove,
  })
}
