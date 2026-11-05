import type { FastifyRequest } from 'fastify'
import { env } from '../config/env.js'
import { COOKIE_NAMES } from '../constants/cookies.js'
import { UnauthorizedException } from '../exceptions/index.js'
import type { AuthUser } from '../interfaces/common/auth.interface.js'
import { resolveBypassUser } from '../utils/auth-bypass.util.js'
import { tokenService } from '../utils/token.util.js'

/**
 * Lee el JWT de acceso desde la cookie httpOnly y adjunta el usuario a la request.
 * No se acepta el token por header Authorization: la sesión vive solo en cookies.
 *
 * Con AUTH_BYPASS=true (modo temporal) las peticiones sin sesión válida se atienden
 * como el administrador principal.
 */
export async function authenticate(request: FastifyRequest): Promise<void> {
  const token = request.cookies[COOKIE_NAMES.ACCESS_TOKEN]

  if (token) {
    try {
      const payload = tokenService.verifyAccess(token)
      request.user = { id: payload.sub, name: payload.name, email: payload.email, role: payload.role }
      return
    } catch (error) {
      if (!env.auth.bypass) throw error
    }
  }

  if (env.auth.bypass) {
    const user = await resolveBypassUser()
    if (user) {
      request.user = user
      return
    }
  }

  throw new UnauthorizedException('Debes iniciar sesión')
}

/** Obtiene el usuario autenticado o lanza 401 (para usar en controladores). */
export function currentUser(request: FastifyRequest): AuthUser {
  if (!request.user) throw new UnauthorizedException()
  return request.user
}
