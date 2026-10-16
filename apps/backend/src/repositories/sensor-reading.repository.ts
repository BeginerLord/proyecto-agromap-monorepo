import type { SensorReading } from '../interfaces/entities/index.js'
import type { CreateSensorReadingData, ISensorReadingRepository } from '../interfaces/repositories/index.js'
import { SensorReadingModel } from '../models/index.js'
import { MongooseRepository } from './base.repository.js'

export class SensorReadingRepository
  extends MongooseRepository<SensorReading, CreateSensorReadingData>
  implements ISensorReadingRepository
{
  constructor() {
    super(SensorReadingModel, [], { recordedAt: -1 })
  }

  async insertMany(readings: CreateSensorReadingData[]): Promise<number> {
    if (readings.length === 0) return 0
    const inserted = await SensorReadingModel.insertMany(readings, { ordered: false })
    return inserted.length
  }
}
