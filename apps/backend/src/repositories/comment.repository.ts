import { Types } from 'mongoose'
import type { CommentStatus } from '../constants/domain.js'
import type { Comment } from '../interfaces/entities/index.js'
import type {
  CreateCommentData,
  ICommentRepository,
  UpdateCommentData,
} from '../interfaces/repositories/index.js'
import { CommentModel } from '../models/index.js'
import { MongooseRepository } from './base.repository.js'

export class CommentRepository
  extends MongooseRepository<Comment, CreateCommentData, UpdateCommentData>
  implements ICommentRepository
{
  constructor() {
    super(CommentModel, [
      { path: 'plot', select: 'name' },
      { path: 'distribution', select: 'title' },
      { path: 'moderatedBy', select: 'name' },
    ])
  }

  async approvedCountByDistribution(distributionIds: string[]): Promise<Map<string, number>> {
    const ids = distributionIds.filter(Types.ObjectId.isValid).map((id) => new Types.ObjectId(id))
    const rows = await CommentModel.aggregate<{ _id: Types.ObjectId; count: number }>([
      { $match: { distribution: { $in: ids }, status: 'approved' } },
      { $group: { _id: '$distribution', count: { $sum: 1 } } },
    ])
    return new Map(rows.map((row) => [row._id.toString(), row.count]))
  }

  async countByStatus(): Promise<Partial<Record<CommentStatus, number>>> {
    const rows = await CommentModel.aggregate<{ _id: CommentStatus; count: number }>([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ])
    return Object.fromEntries(rows.map((row) => [row._id, row.count]))
  }
}
