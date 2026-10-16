import type { FastifyReply, FastifyRequest } from 'fastify'
import type { CreateHarvestDto, HarvestQueryDto, IdParamDto } from '../dtos/index.js'
import type { IHarvestService } from '../interfaces/services/index.js'
import { currentUser } from '../middlewares/index.js'

export class HarvestController {
  constructor(private readonly harvests: IHarvestService) {}

  list = (request: FastifyRequest<{ Querystring: HarvestQueryDto }>) => this.harvests.list(request.query)

  getById = (request: FastifyRequest<{ Params: IdParamDto }>) => this.harvests.getById(request.params.id)

  create = async (request: FastifyRequest<{ Body: CreateHarvestDto }>, reply: FastifyReply) => {
    const harvest = await this.harvests.create(request.body, currentUser(request))
    return reply.status(201).send(harvest)
  }

  remove = async (request: FastifyRequest<{ Params: IdParamDto }>, reply: FastifyReply) => {
    await this.harvests.remove(request.params.id)
    return reply.status(204).send()
  }
}
