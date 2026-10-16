import type { CreateDistributionDto, DistributionQueryDto } from '../dtos/index.js'
import { NotFoundException, UnprocessableException } from '../exceptions/index.js'
import type { AuthUser } from '../interfaces/common/auth.interface.js'
import type { PaginatedResult } from '../interfaces/common/pagination.interface.js'
import type { Distribution, DistributionItem } from '../interfaces/entities/index.js'
import type { IDistributionRepository, IHarvestRepository } from '../interfaces/repositories/index.js'
import type { IDistributionService } from '../interfaces/services/index.js'
import { dateRangeFilter, resolvePagination, toPaginated } from '../utils/index.js'

export class DistributionService implements IDistributionService {
  constructor(
    private readonly distributions: IDistributionRepository,
    private readonly harvests: IHarvestRepository,
  ) {}

  async list(query: DistributionQueryDto): Promise<PaginatedResult<Distribution>> {
    const pagination = resolvePagination(query)
    const filter = dateRangeFilter('date', query.from, query.to)
    return toPaginated(await this.distributions.findMany({ ...pagination, filter }), pagination)
  }

  async getById(id: string): Promise<Distribution> {
    const distribution = await this.distributions.findById(id)
    if (!distribution) throw new NotFoundException('Jornada', id)
    return distribution
  }

  /**
   * Registra una entrega descontando kilos de cada cosecha.
   * Si alguna cosecha no tiene stock suficiente, revierte las reservas ya hechas
   * (compensación manual, válida sin replica set / transacciones).
   */
  async create(dto: CreateDistributionDto, actor: AuthUser): Promise<Distribution> {
    const reserved: { harvestId: string; quantityKg: number }[] = []
    const items: DistributionItem[] = []

    try {
      for (const item of dto.items) {
        const harvest = await this.harvests.findById(item.harvestId)
        if (!harvest) throw new NotFoundException('Cosecha', item.harvestId)
        if (!(await this.harvests.reserveKg(item.harvestId, item.quantityKg))) {
          throw new UnprocessableException(
            `Stock insuficiente de ${harvest.crop.species}: disponibles ${harvest.availableKg} kg`,
          )
        }
        reserved.push(item)
        items.push({ harvest: harvest.id, species: harvest.crop.species, quantityKg: item.quantityKg })
      }

      const date = new Date(dto.date)
      return await this.distributions.create({
        date,
        title: dto.title?.trim() || `Jornada sabatina ${date.toLocaleDateString('es-CO')}`,
        items,
        totalKg: Number(items.reduce((sum, i) => sum + i.quantityKg, 0).toFixed(2)),
        beneficiaries: dto.beneficiaries,
        notes: dto.notes,
        createdBy: actor.id,
      })
    } catch (error) {
      await Promise.all(reserved.map((r) => this.harvests.releaseKg(r.harvestId, r.quantityKg)))
      throw error
    }
  }
}
