import type { AuthUser } from '../interfaces/common/auth.interface.js'

declare module 'fastify' {
  interface FastifyRequest {
    /** Usuario autenticado; lo adjunta el middleware `authenticate`. */
    user?: AuthUser
  }
}
