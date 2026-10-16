import type { FastifyReply, FastifyRequest } from 'fastify'
import type { CreateDistributionDto, DistributionQueryDto, IdParamDto } from '../dtos/index.js'
import type { IDistributionService } from '../interfaces/services/index.js'
import { currentUser } from '../middlewares/index.js'

export class DistributionController {
  constructor(private readonly distributions: IDistributionService) {}

  list = (request: FastifyRequest<{ Querystring: DistributionQueryDto }>) => this.distributions.list(request.query)

  getById = (request: FastifyRequest<{ Params: IdParamDto }>) => this.distributions.getById(request.params.id)

  create = async (request: FastifyRequest<{ Body: CreateDistributionDto }>, reply: FastifyReply) => {
    const distribution = await this.distributions.create(request.body, currentUser(request))
    return reply.status(201).send(distribution)
  }
}
