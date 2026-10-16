import type { FastifyRequest, preHandlerAsyncHookHandler } from 'fastify'
import type { Role } from '../constants/roles.js'
import { ForbiddenException, UnauthorizedException } from '../exceptions/index.js'

/**
 * Autorización por roles (RBAC). Debe ejecutarse después de `authenticate`.
 * @example preHandler: [authenticate, authorize(ROLES.ADMIN)]
 */
export function authorize(...roles: readonly Role[]): preHandlerAsyncHookHandler {
  return async function authorizeHandler(request: FastifyRequest) {
    if (!request.user) throw new UnauthorizedException()
    if (roles.length > 0 && !roles.includes(request.user.role)) throw new ForbiddenException()
  }
}
