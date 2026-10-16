import type { FastifyReply, FastifyRequest } from 'fastify'
import { COOKIE_NAMES } from '../constants/cookies.js'
import type { LoginDto, RegisterDto } from '../dtos/index.js'
import type { IAuthService } from '../interfaces/services/index.js'
import { currentUser } from '../middlewares/index.js'
import { clearAuthCookies, setAuthCookies } from '../utils/index.js'

export class AuthController {
  constructor(private readonly auth: IAuthService) {}

  register = async (request: FastifyRequest<{ Body: RegisterDto }>, reply: FastifyReply) => {
    const { user, tokens } = await this.auth.register(request.body)
    setAuthCookies(reply, tokens)
    return reply.status(201).send({ user })
  }

  login = async (request: FastifyRequest<{ Body: LoginDto }>, reply: FastifyReply) => {
    const { user, tokens } = await this.auth.login(request.body)
    setAuthCookies(reply, tokens)
    return { user }
  }

  refresh = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { user, tokens } = await this.auth.refresh(request.cookies[COOKIE_NAMES.REFRESH_TOKEN])
      setAuthCookies(reply, tokens)
      return { user }
    } catch (error) {
      clearAuthCookies(reply)
      throw error
    }
  }

  logout = async (request: FastifyRequest, reply: FastifyReply) => {
    await this.auth.logout(currentUser(request).id)
    clearAuthCookies(reply)
    return { message: 'Sesión cerrada' }
  }

  me = async (request: FastifyRequest) => {
    return { user: await this.auth.me(currentUser(request).id) }
  }
}
