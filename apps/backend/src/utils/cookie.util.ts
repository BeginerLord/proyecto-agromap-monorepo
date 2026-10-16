import type { CookieSerializeOptions } from '@fastify/cookie'
import type { FastifyReply } from 'fastify'
import { env } from '../config/env.js'
import { COOKIE_NAMES } from '../constants/cookies.js'
import type { AuthTokens } from '../interfaces/common/auth.interface.js'
import { durationToSeconds } from './duration.util.js'

/** El refresh token solo viaja a las rutas de autenticación. */
const REFRESH_PATH = `${env.apiPrefix}/auth`

function baseOptions(): CookieSerializeOptions {
  return {
    httpOnly: true,
    secure: env.cookie.secure,
    sameSite: 'lax',
    domain: env.cookie.domain,
    signed: false,
  }
}

export function setAuthCookies(reply: FastifyReply, tokens: AuthTokens): void {
  reply
    .setCookie(COOKIE_NAMES.ACCESS_TOKEN, tokens.accessToken, {
      ...baseOptions(),
      path: '/',
      maxAge: durationToSeconds(env.jwt.accessExpiresIn),
    })
    .setCookie(COOKIE_NAMES.REFRESH_TOKEN, tokens.refreshToken, {
      ...baseOptions(),
      path: REFRESH_PATH,
      maxAge: durationToSeconds(env.jwt.refreshExpiresIn),
    })
}

export function clearAuthCookies(reply: FastifyReply): void {
  reply
    .clearCookie(COOKIE_NAMES.ACCESS_TOKEN, { ...baseOptions(), path: '/' })
    .clearCookie(COOKIE_NAMES.REFRESH_TOKEN, { ...baseOptions(), path: REFRESH_PATH })
}
