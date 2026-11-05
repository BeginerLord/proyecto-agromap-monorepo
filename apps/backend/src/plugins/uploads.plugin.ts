import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import { IMMUTABLE_CACHE, LocalFileStorage } from '../adapters/storage/index.js'
import { env } from '../config/env.js'
import { fileStorage } from '../container.js'
import { NotFoundException } from '../exceptions/index.js'

/** Claves válidas: UUID con prefijo opcional de carpetas; impide rutas como "../". */
const SAFE_KEY = /^(?:[\w-]+\/)*[\w-]+\.(?:webp|png|jpe?g)$/i

/**
 * Sirve /uploads/* desde el almacenamiento activo:
 * - Backblaze B2 con bucket privado: la API lee el objeto y lo envía (el navegador y nginx lo cachean).
 * - Disco local: igual que antes.
 * Con B2 activo, las fotos antiguas que siguen en disco se sirven desde ahí hasta migrarlas.
 */
export const uploadsPlugin = fp(async (app: FastifyInstance) => {
  const legacy = fileStorage.driver === 'local' ? null : new LocalFileStorage(env.uploads.dir, env.uploads.publicPath)

  app.get(`${env.uploads.publicPath}*`, {
    // Una galería pide muchas imágenes a la vez: límite propio, más amplio que el de la API
    config: { rateLimit: { max: 600, timeWindow: '1 minute' } },
    schema: { hide: true },
    handler: async (request, reply) => {
      const key = (request.params as { '*': string })['*']
      if (!SAFE_KEY.test(key)) throw new NotFoundException('Archivo')

      // Primero el disco (gratis, archivos aún no migrados) y luego B2: así un fallo de B2
      // no impide mostrar lo que sigue en disco, y no se gasta una descarga de B2 en ellos.
      const object = (await legacy?.get(key)) ?? (await fileStorage.get(key))
      if (!object) throw new NotFoundException('Archivo')

      reply.header('Cache-Control', IMMUTABLE_CACHE).type(object.contentType ?? 'application/octet-stream')
      if (object.contentLength) reply.header('Content-Length', object.contentLength)
      if (object.etag) reply.header('ETag', object.etag)
      return reply.send(object.body)
    },
  })
})
