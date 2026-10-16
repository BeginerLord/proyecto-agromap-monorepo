import type { CreateCropDto, CropQueryDto, UpdateCropDto } from '../dtos/index.js'
import { BadRequestException, ConflictException, NotFoundException } from '../exceptions/index.js'
import type { AuthUser } from '../interfaces/common/auth.interface.js'
import type { PaginatedResult } from '../interfaces/common/pagination.interface.js'
import type { Crop } from '../interfaces/entities/index.js'
import type { ICropRepository, IHarvestRepository, IPlotRepository } from '../interfaces/repositories/index.js'
import type { ICropService } from '../interfaces/services/index.js'
import { addDays, compact, resolvePagination, searchFilter, toDate, toPaginated } from '../utils/index.js'

export class CropService implements ICropService {
  constructor(
    private readonly crops: ICropRepository,
    private readonly plots: IPlotRepository,
    private readonly harvests: IHarvestRepository,
  ) {}

  async list(query: CropQueryDto): Promise<PaginatedResult<Crop>> {
    const pagination = resolvePagination(query)
    const filter = {
      ...searchFilter(query.search, ['species', 'variety']),
      ...(query.plotId && { plot: query.plotId }),
      ...(query.status && { status: query.status }),
    }
    return toPaginated(await this.crops.findMany({ ...pagination, filter }), pagination)
  }

  async getById(id: string): Promise<Crop> {
    const crop = await this.crops.findById(id)
    if (!crop) throw new NotFoundException('Cultivo', id)
    return crop
  }

  async create(dto: CreateCropDto, actor: AuthUser): Promise<Crop> {
    if (!(await this.plots.exists({ _id: dto.plotId }))) throw new NotFoundException('Predio', dto.plotId)
    const { plotId, plantedAt: _p, expectedHarvestAt: _e, ...rest } = dto
    const dates = this.resolveDates(dto)
    return this.crops.create({
      ...rest,
      ...dates,
      status: rest.status ?? (dates.plantedAt ? 'planted' : 'planned'),
      plot: plotId,
      createdBy: actor.id,
    })
  }

  async update(id: string, dto: UpdateCropDto): Promise<Crop> {
    const current = await this.getById(id)
    const touchesDates = [dto.plantedAt, dto.cycleDays, dto.expectedHarvestAt].some((v) => v !== undefined)
    // Solo se recalcula la fecha estimada cuando cambian los datos que la determinan
    const dates = touchesDates
      ? this.resolveDates({
          plantedAt: dto.plantedAt ?? current.plantedAt,
          cycleDays: dto.cycleDays ?? current.cycleDays,
          expectedHarvestAt: dto.expectedHarvestAt,
        })
      : {}
    const { plantedAt: _p, expectedHarvestAt: _e, ...rest } = dto
    const crop = await this.crops.updateById(id, compact({ ...rest, ...dates }))
    if (!crop) throw new NotFoundException('Cultivo', id)
    return crop
  }

  async remove(id: string): Promise<void> {
    if (await this.harvests.exists({ crop: id })) {
      throw new ConflictException('El cultivo tiene cosechas registradas; márcalo como finalizado')
    }
    if (!(await this.crops.deleteById(id))) throw new NotFoundException('Cultivo', id)
  }

  /** Si hay fecha de siembra y ciclo, estima automáticamente la fecha de cosecha. */
  private resolveDates(input: {
    plantedAt?: string | Date
    expectedHarvestAt?: string | Date
    cycleDays?: number
  }): { plantedAt?: Date; expectedHarvestAt?: Date } {
    const plantedAt = toDate(input.plantedAt)
    let expectedHarvestAt = toDate(input.expectedHarvestAt)
    if (!expectedHarvestAt && plantedAt && input.cycleDays) {
      expectedHarvestAt = addDays(plantedAt, input.cycleDays)
    }
    if (plantedAt && expectedHarvestAt && expectedHarvestAt < plantedAt) {
      throw new BadRequestException('La fecha de cosecha no puede ser anterior a la siembra')
    }
    return { plantedAt, expectedHarvestAt }
  }
}
