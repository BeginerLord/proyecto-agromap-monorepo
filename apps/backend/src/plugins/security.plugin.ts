import cookie from '@fastify/cookie'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import multipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'
import { mkdirSync } from 'node:fs'
import rateLimit from '@fastify/rate-limit'
import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import { env } from '../config/env.js'

/** Cabeceras de seguridad, CORS, cookies, rate limit, subida de archivos y estáticos de /uploads. */
export const securityPlugin = fp(async (app: FastifyInstance) => {
  await app.register(helmet, {
    // La API solo devuelve JSON; la CSP se desactiva para que la UI de Scalar (/docs) funcione.
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'same-site' },
  })

  await app.register(cors, {
    origin: env.corsOrigin,
    credentials: true, // necesario para enviar/recibir cookies httpOnly desde el front
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })

  await app.register(cookie, { secret: env.cookie.secret })

  await app.register(rateLimit, {
    max: env.rateLimit.max,
    timeWindow: env.rateLimit.timeWindow,
  })

  await app.register(multipart, {
    limits: { fileSize: env.uploads.maxFileSizeMb * 1024 * 1024, files: 1, fields: 10 },
  })

  // Las evidencias se sirven como archivos estáticos (solo lectura, sin listado de carpeta)
  mkdirSync(env.uploads.dir, { recursive: true })
  await app.register(fastifyStatic, {
    root: env.uploads.dir,
    prefix: env.uploads.publicPath,
    decorateReply: false,
    index: false,
    list: false,
    maxAge: '7d',
  })
})
