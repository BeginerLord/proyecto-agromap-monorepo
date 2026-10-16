import type { FastifyRequest } from 'fastify'
import type { IdParamDto, UpdateUserDto, UserQueryDto } from '../dtos/index.js'
import type { IUserService } from '../interfaces/services/index.js'
import { currentUser } from '../middlewares/index.js'

export class UserController {
  constructor(private readonly users: IUserService) {}

  list = (request: FastifyRequest<{ Querystring: UserQueryDto }>) => this.users.list(request.query)

  getById = (request: FastifyRequest<{ Params: IdParamDto }>) => this.users.getById(request.params.id)

  update = (request: FastifyRequest<{ Params: IdParamDto; Body: UpdateUserDto }>) =>
    this.users.update(request.params.id, request.body, currentUser(request))
}
