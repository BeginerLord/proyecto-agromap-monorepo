import type { FastifyReply, FastifyRequest } from 'fastify'
import type {
  CreatePublicCommentDto,
  IdParamDto,
  PaginationQueryDto,
  PublicCommentQueryDto,
  PublicGalleryQueryDto,
} from '../dtos/index.js'
import type { ICommentService, IPublicService } from '../interfaces/services/index.js'

/** Endpoints del sitio público (sin autenticación). */
export class PublicController {
  constructor(
    private readonly publicService: IPublicService,
    private readonly commentService: ICommentService,
  ) {}

  overview = () => this.publicService.overview()

  plots = () => this.publicService.plots()

  plot = (request: FastifyRequest<{ Params: IdParamDto }>) => this.publicService.plot(request.params.id)

  distributions = (request: FastifyRequest<{ Querystring: PaginationQueryDto }>) =>
    this.publicService.distributions(request.query)

  gallery = (request: FastifyRequest<{ Querystring: PublicGalleryQueryDto }>) =>
    this.publicService.gallery(request.query)

  comments = (request: FastifyRequest<{ Querystring: PublicCommentQueryDto }>) =>
    this.publicService.comments(request.query)

  submitComment = async (request: FastifyRequest<{ Body: CreatePublicCommentDto }>, reply: FastifyReply) => {
    const result = await this.commentService.submit(request.body, request.ip)
    return reply.status(202).send(result)
  }
}
