import type { Harvest } from '../interfaces/entities/index.js'
import type { CreateHarvestData, HarvestTotals, IHarvestRepository } from '../interfaces/repositories/index.js'
import { HarvestModel } from '../models/index.js'
import { MongooseRepository } from './base.repository.js'

export class HarvestRepository extends MongooseRepository<Harvest, CreateHarvestData> implements IHarvestRepository {
  constructor() {
    super(
      HarvestModel,
      [
        { path: 'crop', select: 'species variety' },
        { path: 'plot', select: 'name' },
        { path: 'registeredBy', select: 'name' },
      ],
      { harvestedAt: -1 },
    )
  }

  async totals(): Promise<HarvestTotals> {
    const [row] = await HarvestModel.aggregate<HarvestTotals>([
      { $group: { _id: null, harvestedKg: { $sum: '$quantityKg' }, availableKg: { $sum: '$availableKg' } } },
      { $project: { _id: 0, harvestedKg: 1, availableKg: 1 } },
    ])
    return row ?? { harvestedKg: 0, availableKg: 0 }
  }

  async reserveKg(id: string, quantityKg: number): Promise<boolean> {
    const result = await HarvestModel.updateOne(
      { _id: id, availableKg: { $gte: quantityKg } },
      { $inc: { availableKg: -quantityKg } },
    )
    return result.modifiedCount === 1
  }

  async releaseKg(id: string, quantityKg: number): Promise<void> {
    await HarvestModel.updateOne({ _id: id }, { $inc: { availableKg: quantityKg } })
  }
}
