import type { FieldLog } from '../interfaces/entities/index.js'
import type { CreateFieldLogData, IFieldLogRepository } from '../interfaces/repositories/index.js'
import { FieldLogModel } from '../models/index.js'
import { MongooseRepository } from './base.repository.js'

export class FieldLogRepository
  extends MongooseRepository<FieldLog, CreateFieldLogData>
  implements IFieldLogRepository
{
  constructor() {
    super(
      FieldLogModel,
      [
        { path: 'crop', select: 'species variety' },
        { path: 'plot', select: 'name' },
        { path: 'author', select: 'name' },
      ],
      { date: -1 },
    )
  }

  async findRecent(limit: number): Promise<FieldLog[]> {
    const docs = await FieldLogModel.find().sort({ date: -1 }).limit(limit).populate(this.populate)
    return this.toEntities(docs)
  }
}
