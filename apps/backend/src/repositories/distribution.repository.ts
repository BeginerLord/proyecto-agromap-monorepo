import type { Distribution } from '../interfaces/entities/index.js'
import type {
  CreateDistributionData,
  DistributionTotals,
  IDistributionRepository,
} from '../interfaces/repositories/index.js'
import { DistributionModel } from '../models/index.js'
import { MongooseRepository } from './base.repository.js'

export class DistributionRepository
  extends MongooseRepository<Distribution, CreateDistributionData>
  implements IDistributionRepository
{
  constructor() {
    super(DistributionModel, [{ path: 'createdBy', select: 'name' }], { date: -1 })
  }

  async totals(): Promise<DistributionTotals> {
    const [row] = await DistributionModel.aggregate<DistributionTotals>([
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          distributedKg: { $sum: '$totalKg' },
          beneficiaries: { $sum: '$beneficiaries' },
        },
      },
      { $project: { _id: 0, count: 1, distributedKg: 1, beneficiaries: 1 } },
    ])
    return row ?? { count: 0, distributedKg: 0, beneficiaries: 0 }
  }
}
