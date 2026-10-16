import type { CreateHarvestDto, HarvestQueryDto } from '../dtos/index.js'
import { ConflictException, NotFoundException } from '../exceptions/index.js'
import type { AuthUser } from '../interfaces/common/auth.interface.js'
import type { PaginatedResult } from '../interfaces/common/pagination.interface.js'
import type { Harvest } from '../interfaces/entities/index.js'
import type { ICropRepository, IHarvestRepository } from '../interfaces/repositories/index.js'
import type { IHarvestService } from '../interfaces/services/index.js'
import { resolvePagination, toDate, toPaginated } from '../utils/index.js'

export class HarvestService implements IHarvestService {
  constructor(
    private readonly harvests: IHarvestRepository,
    private readonly crops: ICropRepository,
  ) {}

  async list(query: HarvestQueryDto): Promise<PaginatedResult<Harvest>> {
    const pagination = resolvePagination(query)
    const filter = {
      ...(query.cropId && { crop: query.cropId }),
      ...(query.plotId && { plot: query.plotId }),
      ...(query.onlyAvailable && { availableKg: { $gt: 0 } }),
    }
    return toPaginated(await this.harvests.findMany({ ...pagination, filter }), pagination)
  }

  async getById(id: string): Promise<Harvest> {
    const harvest = await this.harvests.findById(id)
    if (!harvest) throw new NotFoundException('Cosecha', id)
    return harvest
  }

  async create(dto: CreateHarvestDto, actor: AuthUser): Promise<Harvest> {
    const crop = await this.crops.findById(dto.cropId)
    if (!crop) throw new NotFoundException('Cultivo', dto.cropId)

    const harvest = await this.harvests.create({
      crop: crop.id,
      plot: crop.plot.id,
      harvestedAt: toDate(dto.harvestedAt) ?? new Date(),
      quantityKg: dto.quantityKg,
      availableKg: dto.quantityKg,
      quality: dto.quality ?? 'medium',
      notes: dto.notes,
      registeredBy: actor.id,
    })

    if (crop.status !== 'harvesting' && crop.status !== 'finished') {
      await this.crops.updateById(crop.id, { status: 'harvesting' })
    }
    return harvest
  }

  async remove(id: string): Promise<void> {
    const harvest = await this.getById(id)
    if (harvest.availableKg < harvest.quantityKg) {
      throw new ConflictException('La cosecha ya fue distribuida parcialmente y no puede eliminarse')
    }
    await this.harvests.deleteById(id)
  }
}
