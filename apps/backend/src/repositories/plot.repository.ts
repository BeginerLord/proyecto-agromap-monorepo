import type { Plot } from '../interfaces/entities/index.js'
import type { CreatePlotData, IPlotRepository } from '../interfaces/repositories/index.js'
import { PlotModel } from '../models/index.js'
import { MongooseRepository } from './base.repository.js'

export class PlotRepository extends MongooseRepository<Plot, CreatePlotData> implements IPlotRepository {
  constructor() {
    super(PlotModel, [{ path: 'createdBy', select: 'name' }], { name: 1 })
  }
}
