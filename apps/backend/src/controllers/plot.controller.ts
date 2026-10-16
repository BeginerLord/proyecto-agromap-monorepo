import type { FastifyReply, FastifyRequest } from 'fastify'
import type { CreatePlotDto, IdParamDto, PlotQueryDto, UpdatePlotDto } from '../dtos/index.js'
import type { IPlotService } from '../interfaces/services/index.js'
import { currentUser } from '../middlewares/index.js'

export class PlotController {
  constructor(private readonly plots: IPlotService) {}

  list = (request: FastifyRequest<{ Querystring: PlotQueryDto }>) => this.plots.list(request.query)

  getById = (request: FastifyRequest<{ Params: IdParamDto }>) => this.plots.getById(request.params.id)

  create = async (request: FastifyRequest<{ Body: CreatePlotDto }>, reply: FastifyReply) => {
    const plot = await this.plots.create(request.body, currentUser(request))
    return reply.status(201).send(plot)
  }

  update = (request: FastifyRequest<{ Params: IdParamDto; Body: UpdatePlotDto }>) =>
    this.plots.update(request.params.id, request.body)

  remove = async (request: FastifyRequest<{ Params: IdParamDto }>, reply: FastifyReply) => {
    await this.plots.remove(request.params.id)
    return reply.status(204).send()
  }
}
