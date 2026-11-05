import { createHash } from 'node:crypto'
import { env } from '../config/env.js'
import type { CommentQueryDto, CreatePublicCommentDto, ModerateCommentDto } from '../dtos/index.js'
import { NotFoundException } from '../exceptions/index.js'
import type { AuthUser } from '../interfaces/common/auth.interface.js'
import type { PaginatedResult } from '../interfaces/common/pagination.interface.js'
import type { Comment } from '../interfaces/entities/index.js'
import type { ICommentRepository, IDistributionRepository, IPlotRepository } from '../interfaces/repositories/index.js'
import type { ICommentService } from '../interfaces/services/index.js'
import { resolvePagination, searchFilter, toPaginated } from '../utils/index.js'

const RECEIVED = 'Gracias por compartir tu experiencia. Se publicará cuando el equipo la revise.'

export class CommentService implements ICommentService {
  constructor(
    private readonly comments: ICommentRepository,
    private readonly plots: IPlotRepository,
    private readonly distributions: IDistributionRepository,
  ) {}

  async list(query: CommentQueryDto): Promise<PaginatedResult<Comment>> {
    const pagination = resolvePagination(query)
    const filter = {
      ...searchFilter(query.search, ['authorName', 'message']),
      ...(query.status && { status: query.status }),
    }
    return toPaginated(await this.comments.findMany({ ...pagination, filter }), pagination)
  }

  async stats(): Promise<Record<string, number>> {
    return { pending: 0, approved: 0, rejected: 0, ...(await this.comments.countByStatus()) }
  }

  /**
   * Comentario desde el sitio público. Siempre queda "pendiente" hasta moderarse.
   * Si el campo trampa viene lleno (bot) se responde igual, pero no se guarda.
   */
  async submit(dto: CreatePublicCommentDto, ip: string): Promise<{ message: string; status: Comment['status'] }> {
    if (dto.website?.trim()) return { message: RECEIVED, status: 'pending' }

    const plot = dto.plotId && (await this.plots.exists({ _id: dto.plotId })) ? dto.plotId : undefined
    const distribution =
      dto.distributionId && (await this.distributions.exists({ _id: dto.distributionId })) ? dto.distributionId : undefined

    await this.comments.create({
      authorName: dto.authorName.trim(),
      authorRole: dto.authorRole ?? 'visitor',
      message: dto.message.trim(),
      rating: dto.rating,
      plot,
      distribution,
      status: 'pending',
      ipHash: createHash('sha256').update(`${env.cookie.secret}:${ip}`).digest('hex').slice(0, 32),
    })
    return { message: RECEIVED, status: 'pending' }
  }

  async moderate(id: string, dto: ModerateCommentDto, actor: AuthUser): Promise<Comment> {
    const comment = await this.comments.updateById(id, {
      status: dto.status,
      moderatedBy: actor.id,
      moderatedAt: new Date(),
    })
    if (!comment) throw new NotFoundException('Comentario', id)
    return comment
  }

  async remove(id: string): Promise<void> {
    if (!(await this.comments.deleteById(id))) throw new NotFoundException('Comentario', id)
  }
}
