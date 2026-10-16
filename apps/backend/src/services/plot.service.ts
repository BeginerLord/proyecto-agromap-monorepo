import type { CreatePlotDto, PlotQueryDto, UpdatePlotDto } from '../dtos/index.js'
import { ConflictException, NotFoundException } from '../exceptions/index.js'
import type { AuthUser } from '../interfaces/common/auth.interface.js'
import type { PaginatedResult } from '../interfaces/common/pagination.interface.js'
import type { Plot } from '../interfaces/entities/index.js'
import type { ICropRepository, IPlotRepository } from '../interfaces/repositories/index.js'
import type { IPlotService } from '../interfaces/services/index.js'
import { compact, escapeRegex, resolvePagination, searchFilter, toPaginated } from '../utils/index.js'

export class PlotService implements IPlotService {
  constructor(
    private readonly plots: IPlotRepository,
    private readonly crops: ICropRepository,
  ) {}

  async list(query: PlotQueryDto): Promise<PaginatedResult<Plot>> {
    const pagination = resolvePagination(query)
    const filter = {
      ...searchFilter(query.search, ['name', 'owner.name', 'location.district']),
      ...(query.status && { status: query.status }),
      ...(query.district && { 'location.district': { $regex: `^${escapeRegex(query.district)}$`, $options: 'i' } }),
    }
    return toPaginated(await this.plots.findMany({ ...pagination, filter }), pagination)
  }

  async getById(id: string): Promise<Plot> {
    const plot = await this.plots.findById(id)
    if (!plot) throw new NotFoundException('Predio', id)
    return plot
  }

  create(dto: CreatePlotDto, actor: AuthUser): Promise<Plot> {
    return this.plots.create({ ...dto, createdBy: actor.id })
  }

  async update(id: string, dto: UpdatePlotDto): Promise<Plot> {
    const plot = await this.plots.updateById(id, compact(dto))
    if (!plot) throw new NotFoundException('Predio', id)
    return plot
  }

  async remove(id: string): Promise<void> {
    if (await this.crops.exists({ plot: id })) {
      throw new ConflictException('El predio tiene cultivos asociados; márcalo como inactivo en su lugar')
    }
    if (!(await this.plots.deleteById(id))) throw new NotFoundException('Predio', id)
  }
}
