import type { AccessTokenPayload, AuthTokens, RefreshTokenPayload } from '../common/auth.interface.js'

export interface IPasswordHasher {
  hash(plain: string): Promise<string>
  compare(plain: string, hash: string): Promise<boolean>
}

export interface ITokenService {
  issue(access: AccessTokenPayload, refresh: RefreshTokenPayload): AuthTokens
  verifyAccess(token: string): AccessTokenPayload
  verifyRefresh(token: string): RefreshTokenPayload
}
