import type { CropStatus } from '../constants/domain.js'
import type { Crop } from '../interfaces/entities/index.js'
import type { CreateCropData, ICropRepository } from '../interfaces/repositories/index.js'
import { CropModel } from '../models/index.js'
import { MongooseRepository } from './base.repository.js'

export class CropRepository extends MongooseRepository<Crop, CreateCropData> implements ICropRepository {
  constructor() {
    super(CropModel, [
      { path: 'plot', select: 'name' },
      { path: 'createdBy', select: 'name' },
    ])
  }

  async countByStatus(): Promise<Partial<Record<CropStatus, number>>> {
    const rows = await CropModel.aggregate<{ _id: CropStatus; count: number }>([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ])
    return Object.fromEntries(rows.map((row) => [row._id, row.count]))
  }

  async findUpcomingHarvests(from: Date, to: Date, limit: number): Promise<Crop[]> {
    const docs = await CropModel.find({
      expectedHarvestAt: { $gte: from, $lte: to },
      status: { $in: ['planted', 'growing', 'harvesting'] },
    })
      .sort({ expectedHarvestAt: 1 })
      .limit(limit)
      .populate(this.populate)
    return this.toEntities(docs)
  }
}
