import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { controllers } from '../container.js'
import { AuthResponseDto, LoginDto, MessageResponseDto, RegisterDto, errorResponses } from '../dtos/index.js'
import { authenticate } from '../middlewares/index.js'

export const authRoutes: FastifyPluginAsyncTypebox = async (app) => {
  const ctrl = controllers.auth
  const tags = ['Auth']

  app.post('/register', {
    config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
    schema: {
      tags,
      summary: 'Registrar cuenta (rol estudiante)',
      description: 'Crea la cuenta y deja la sesión iniciada mediante cookies httpOnly.',
      body: RegisterDto,
      response: { 201: AuthResponseDto, 400: errorResponses[400], 409: errorResponses[409] },
    },
    handler: ctrl.register,
  })

  app.post('/login', {
    config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
    schema: {
      tags,
      summary: 'Iniciar sesión',
      description: 'Valida credenciales y emite las cookies `agromap_at` (acceso) y `agromap_rt` (refresco).',
      body: LoginDto,
      response: { 200: AuthResponseDto, 401: errorResponses[401], 403: errorResponses[403] },
    },
    handler: ctrl.login,
  })

  app.post('/refresh', {
    schema: {
      tags,
      summary: 'Renovar sesión',
      description: 'Usa la cookie de refresco para emitir un nuevo par de tokens (rotación).',
      response: { 200: AuthResponseDto, 401: errorResponses[401] },
    },
    handler: ctrl.refresh,
  })

  app.post('/logout', {
    preHandler: [authenticate],
    schema: {
      tags,
      summary: 'Cerrar sesión',
      description: 'Invalida los refresh tokens emitidos y borra las cookies.',
      security: [{ cookieAuth: [] }],
      response: { 200: MessageResponseDto, 401: errorResponses[401] },
    },
    handler: ctrl.logout,
  })

  app.get('/me', {
    preHandler: [authenticate],
    schema: {
      tags,
      summary: 'Usuario de la sesión actual',
      security: [{ cookieAuth: [] }],
      response: { 200: AuthResponseDto, 401: errorResponses[401] },
    },
    handler: ctrl.me,
  })
}
