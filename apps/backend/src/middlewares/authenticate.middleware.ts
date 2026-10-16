import type { FastifyRequest } from 'fastify'
import { COOKIE_NAMES } from '../constants/cookies.js'
import { UnauthorizedException } from '../exceptions/index.js'
import type { AuthUser } from '../interfaces/common/auth.interface.js'
import { tokenService } from '../utils/token.util.js'

/**
 * Lee el JWT de acceso desde la cookie httpOnly y adjunta el usuario a la request.
 * No se acepta el token por header Authorization: la sesión vive solo en cookies.
 */
export async function authenticate(request: FastifyRequest): Promise<void> {
  const token = request.cookies[COOKIE_NAMES.ACCESS_TOKEN]
  if (!token) throw new UnauthorizedException('Debes iniciar sesión')

  const payload = tokenService.verifyAccess(token)
  request.user = { id: payload.sub, name: payload.name, email: payload.email, role: payload.role }
}

/** Obtiene el usuario autenticado o lanza 401 (para usar en controladores). */
export function currentUser(request: FastifyRequest): AuthUser {
  if (!request.user) throw new UnauthorizedException()
  return request.user
}
