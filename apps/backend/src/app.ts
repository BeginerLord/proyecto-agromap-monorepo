import Fastify, { type FastifyServerOptions } from 'fastify'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { env } from './config/env.js'
import { errorHandler, NotFoundException } from './exceptions/index.js'
import { docsPlugin } from './plugins/docs.plugin.js'
import { securityPlugin } from './plugins/security.plugin.js'
import { apiRoutes } from './routes/index.js'

function loggerOptions(): FastifyServerOptions['logger'] {
  if (env.isProduction) return { level: env.logLevel }
  return {
    level: env.logLevel,
    transport: { target: 'pino-pretty', options: { translateTime: 'HH:MM:ss', ignore: 'pid,hostname' } },
  }
}

/** Construye la instancia de Fastify (sin escuchar puerto) — útil también para tests. */
export async function buildApp() {
  const app = Fastify({
    logger: loggerOptions(),
    trustProxy: true,
    ajv: { customOptions: { removeAdditional: 'all', coerceTypes: 'array', useDefaults: true, allErrors: true } },
  }).withTypeProvider<TypeBoxTypeProvider>()

  app.setErrorHandler(errorHandler)
  app.setNotFoundHandler((request) => {
    throw new NotFoundException(`Ruta ${request.method} ${request.url}`)
  })

  await app.register(securityPlugin)
  await app.register(docsPlugin)
  await app.register(apiRoutes, { prefix: env.apiPrefix })

  app.get('/', { schema: { hide: true } }, async (_request, reply) => reply.redirect('/docs'))

  return app
}
