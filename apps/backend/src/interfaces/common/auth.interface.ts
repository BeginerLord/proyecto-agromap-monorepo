import type { Role } from '../../constants/roles.js'

/** Usuario autenticado adjunto a la request por el middleware `authenticate`. */
export interface AuthUser {
  id: string
  name: string
  email: string
  role: Role
}

export interface AccessTokenPayload {
  sub: string
  name: string
  email: string
  role: Role
}

export interface RefreshTokenPayload {
  sub: string
  /** Versión del token; al cerrar sesión se incrementa e invalida los refresh tokens anteriores. */
  tv: number
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}
