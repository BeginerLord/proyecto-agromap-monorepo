import { ROLES } from '../constants/roles.js'
import type { CreateFieldLogDto, FieldLogQueryDto, UpdateFieldLogDto } from '../dtos/index.js'
import { ForbiddenException, NotFoundException } from '../exceptions/index.js'
import type { AuthUser } from '../interfaces/common/auth.interface.js'
import type { PaginatedResult } from '../interfaces/common/pagination.interface.js'
import type { FieldLog } from '../interfaces/entities/index.js'
import type { ICropRepository, IFieldLogRepository } from '../interfaces/repositories/index.js'
import type { IFieldLogService } from '../interfaces/services/index.js'
import { compact, resolvePagination, searchFilter, toDate, toPaginated } from '../utils/index.js'

export class FieldLogService implements IFieldLogService {
  constructor(
    private readonly logs: IFieldLogRepository,
    private readonly crops: ICropRepository,
  ) {}

  async list(query: FieldLogQueryDto): Promise<PaginatedResult<FieldLog>> {
    const pagination = resolvePagination(query)
    const filter = {
      ...searchFilter(query.search, ['description']),
      ...(query.cropId && { crop: query.cropId }),
      ...(query.plotId && { plot: query.plotId }),
      ...(query.type && { type: query.type }),
    }
    return toPaginated(await this.logs.findMany({ ...pagination, filter }), pagination)
  }

  async getById(id: string): Promise<FieldLog> {
    const log = await this.logs.findById(id)
    if (!log) throw new NotFoundException('Registro de bitácora', id)
    return log
  }

  async create(dto: CreateFieldLogDto, actor: AuthUser): Promise<FieldLog> {
    const crop = await this.crops.findById(dto.cropId)
    if (!crop) throw new NotFoundException('Cultivo', dto.cropId)
    return this.logs.create({
      crop: crop.id,
      plot: crop.plot.id,
      date: toDate(dto.date) ?? new Date(),
      type: dto.type,
      description: dto.description,
      photos: dto.photos ?? [],
      author: actor.id,
    })
  }

  async update(id: string, dto: UpdateFieldLogDto, actor: AuthUser): Promise<FieldLog> {
    await this.assertCanModify(id, actor)
    const log = await this.logs.updateById(id, compact({ ...dto, date: toDate(dto.date) }))
    if (!log) throw new NotFoundException('Registro de bitácora', id)
    return log
  }

  async remove(id: string, actor: AuthUser): Promise<void> {
    await this.assertCanModify(id, actor)
    await this.logs.deleteById(id)
  }

  /** Solo el autor o un administrador pueden modificar un registro. */
  private async assertCanModify(id: string, actor: AuthUser): Promise<void> {
    const log = await this.getById(id)
    if (log.author.id !== actor.id && actor.role !== ROLES.ADMIN) {
      throw new ForbiddenException('Solo el autor puede modificar este registro')
    }
  }
}
