import type { FastifyReply, FastifyRequest } from 'fastify'
import type { CommentQueryDto, IdParamDto, ModerateCommentDto } from '../dtos/index.js'
import type { ICommentService } from '../interfaces/services/index.js'
import { currentUser } from '../middlewares/index.js'

/** Moderación de experiencias (panel de administración). */
export class CommentController {
  constructor(private readonly comments: ICommentService) {}

  list = (request: FastifyRequest<{ Querystring: CommentQueryDto }>) => this.comments.list(request.query)

  stats = () => this.comments.stats()

  moderate = (request: FastifyRequest<{ Params: IdParamDto; Body: ModerateCommentDto }>) =>
    this.comments.moderate(request.params.id, request.body, currentUser(request))

  remove = async (request: FastifyRequest<{ Params: IdParamDto }>, reply: FastifyReply) => {
    await this.comments.remove(request.params.id)
    return reply.status(204).send()
  }
}
