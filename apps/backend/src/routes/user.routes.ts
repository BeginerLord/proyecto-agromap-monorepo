import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { controllers } from '../container.js'
import { ROLES } from '../constants/roles.js'
import {
  IdParamDto,
  UpdateUserDto,
  UserListResponseDto,
  UserQueryDto,
  UserResponseDto,
  errorResponses,
} from '../dtos/index.js'
import { authenticate, authorize } from '../middlewares/index.js'

export const userRoutes: FastifyPluginAsyncTypebox = async (app) => {
  const ctrl = controllers.users
  const tags = ['Usuarios']
  const security = [{ cookieAuth: [] }]

  app.addHook('preHandler', authenticate)
  app.addHook('preHandler', authorize(ROLES.ADMIN))

  app.get('/', {
    schema: { tags, security, summary: 'Listar usuarios', querystring: UserQueryDto, response: { 200: UserListResponseDto } },
    handler: ctrl.list,
  })

  app.get('/:id', {
    schema: {
      tags,
      security,
      summary: 'Obtener usuario',
      params: IdParamDto,
      response: { 200: UserResponseDto, 404: errorResponses[404] },
    },
    handler: ctrl.getById,
  })

  app.patch('/:id', {
    schema: {
      tags,
      security,
      summary: 'Actualizar rol / estado de un usuario',
      params: IdParamDto,
      body: UpdateUserDto,
      response: { 200: UserResponseDto, 400: errorResponses[400], 404: errorResponses[404] },
    },
    handler: ctrl.update,
  })
}
