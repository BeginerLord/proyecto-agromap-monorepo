import { createSigner, createVerifier } from 'fast-jwt'
import { env } from '../config/env.js'
import { UnauthorizedException } from '../exceptions/index.js'
import type { AccessTokenPayload, AuthTokens, RefreshTokenPayload } from '../interfaces/common/auth.interface.js'
import type { ITokenService } from '../interfaces/services/security.interface.js'
import { durationToMs } from './duration.util.js'

const ISSUER = 'agromap-api'

/**
 * Emite y verifica JWT (HS256) con secretos distintos para access y refresh.
 * Los tokens viajan exclusivamente en cookies httpOnly (ver cookie.util.ts).
 */
export class JwtTokenService implements ITokenService {
  private readonly signAccess = createSigner({
    key: env.jwt.accessSecret,
    expiresIn: durationToMs(env.jwt.accessExpiresIn),
    iss: ISSUER,
  })

  private readonly signRefresh = createSigner({
    key: env.jwt.refreshSecret,
    expiresIn: durationToMs(env.jwt.refreshExpiresIn),
    iss: ISSUER,
  })

  private readonly verifyAccessToken = createVerifier({ key: env.jwt.accessSecret, allowedIss: ISSUER })
  private readonly verifyRefreshToken = createVerifier({ key: env.jwt.refreshSecret, allowedIss: ISSUER })

  issue(access: AccessTokenPayload, refresh: RefreshTokenPayload): AuthTokens {
    return {
      accessToken: this.signAccess({ ...access }),
      refreshToken: this.signRefresh({ ...refresh }),
    }
  }

  verifyAccess(token: string): AccessTokenPayload {
    try {
      return this.verifyAccessToken(token) as AccessTokenPayload
    } catch {
      throw new UnauthorizedException('Sesión inválida o expirada')
    }
  }

  verifyRefresh(token: string): RefreshTokenPayload {
    try {
      return this.verifyRefreshToken(token) as RefreshTokenPayload
    } catch {
      throw new UnauthorizedException('La sesión expiró, inicia sesión nuevamente')
    }
  }
}

export const tokenService = new JwtTokenService()
