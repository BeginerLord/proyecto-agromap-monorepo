import { Types } from 'mongoose'
import type { Media } from '../interfaces/entities/index.js'
import type {
  CreateMediaData,
  Filter,
  IMediaRepository,
  UpdateMediaData,
} from '../interfaces/repositories/index.js'
import { MediaModel } from '../models/index.js'
import { MongooseRepository } from './base.repository.js'

const toObjectIds = (ids: string[]) => ids.filter(Types.ObjectId.isValid).map((id) => new Types.ObjectId(id))

export class MediaRepository
  extends MongooseRepository<Media, CreateMediaData, UpdateMediaData>
  implements IMediaRepository
{
  constructor() {
    super(MediaModel, [
      { path: 'plot', select: 'name' },
      { path: 'crop', select: 'species variety' },
      { path: 'uploadedBy', select: 'name' },
    ])
  }

  async findPublic(filter: Filter, limit: number): Promise<Media[]> {
    const docs = await MediaModel.find({ ...filter, isPublic: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate(this.populate)
    return this.toEntities(docs)
  }

  async coversByPlot(plotIds: string[]): Promise<Map<string, { url: string; count: number }>> {
    const rows = await MediaModel.aggregate<{ _id: Types.ObjectId; url: string; count: number }>([
      { $match: { plot: { $in: toObjectIds(plotIds) }, isPublic: true } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: '$plot', url: { $first: '$url' }, count: { $sum: 1 } } },
    ])
    return new Map(rows.map((row) => [row._id.toString(), { url: row.url, count: row.count }]))
  }

  async publicByDistribution(distributionIds: string[]): Promise<Map<string, Media[]>> {
    const docs = await MediaModel.find({ distribution: { $in: toObjectIds(distributionIds) }, isPublic: true })
      .sort({ createdAt: -1 })
      .populate(this.populate)
    const grouped = new Map<string, Media[]>()
    for (const media of this.toEntities(docs)) {
      if (!media.distribution) continue
      grouped.set(media.distribution, [...(grouped.get(media.distribution) ?? []), media])
    }
    return grouped
  }
}
