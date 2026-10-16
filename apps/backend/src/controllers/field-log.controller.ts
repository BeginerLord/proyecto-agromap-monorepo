import type { FastifyReply, FastifyRequest } from 'fastify'
import type { CreateFieldLogDto, FieldLogQueryDto, IdParamDto, UpdateFieldLogDto } from '../dtos/index.js'
import type { IFieldLogService } from '../interfaces/services/index.js'
import { currentUser } from '../middlewares/index.js'

export class FieldLogController {
  constructor(private readonly logs: IFieldLogService) {}

  list = (request: FastifyRequest<{ Querystring: FieldLogQueryDto }>) => this.logs.list(request.query)

  getById = (request: FastifyRequest<{ Params: IdParamDto }>) => this.logs.getById(request.params.id)

  create = async (request: FastifyRequest<{ Body: CreateFieldLogDto }>, reply: FastifyReply) => {
    const log = await this.logs.create(request.body, currentUser(request))
    return reply.status(201).send(log)
  }

  update = (request: FastifyRequest<{ Params: IdParamDto; Body: UpdateFieldLogDto }>) =>
    this.logs.update(request.params.id, request.body, currentUser(request))

  remove = async (request: FastifyRequest<{ Params: IdParamDto }>, reply: FastifyReply) => {
    await this.logs.remove(request.params.id, currentUser(request))
    return reply.status(204).send()
  }
}
