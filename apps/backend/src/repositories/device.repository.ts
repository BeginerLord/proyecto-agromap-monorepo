import type { Device } from '../interfaces/entities/index.js'
import type { CreateDeviceData, IDeviceRepository, UpdateDeviceData } from '../interfaces/repositories/index.js'
import { DeviceModel } from '../models/index.js'
import { MongooseRepository } from './base.repository.js'

export class DeviceRepository
  extends MongooseRepository<Device, CreateDeviceData, UpdateDeviceData>
  implements IDeviceRepository
{
  constructor() {
    super(DeviceModel, [
      { path: 'plot', select: 'name' },
      { path: 'crop', select: 'species variety' },
    ])
  }

  findByExternalId(provider: string, externalId: string): Promise<Device | null> {
    return this.findOne({ provider, externalId })
  }
}
