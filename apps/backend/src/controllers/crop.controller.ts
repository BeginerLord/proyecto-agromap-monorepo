import type { FastifyReply, FastifyRequest } from 'fastify'
import type { CreateCropDto, CropQueryDto, IdParamDto, UpdateCropDto } from '../dtos/index.js'
import type { ICropService } from '../interfaces/services/index.js'
import { currentUser } from '../middlewares/index.js'

export class CropController {
  constructor(private readonly crops: ICropService) {}

  list = (request: FastifyRequest<{ Querystring: CropQueryDto }>) => this.crops.list(request.query)

  getById = (request: FastifyRequest<{ Params: IdParamDto }>) => this.crops.getById(request.params.id)

  create = async (request: FastifyRequest<{ Body: CreateCropDto }>, reply: FastifyReply) => {
    const crop = await this.crops.create(request.body, currentUser(request))
    return reply.status(201).send(crop)
  }

  update = (request: FastifyRequest<{ Params: IdParamDto; Body: UpdateCropDto }>) =>
    this.crops.update(request.params.id, request.body)

  remove = async (request: FastifyRequest<{ Params: IdParamDto }>, reply: FastifyReply) => {
    await this.crops.remove(request.params.id)
    return reply.status(204).send()
  }
}
