import { isValidObjectId, type Model, type PopulateOptions } from 'mongoose'
import type {
  Filter,
  FindManyOptions,
  FindManyResult,
  IBaseRepository,
} from '../interfaces/repositories/base-repository.interface.js'

interface Serializable {
  toJSON(): unknown
}

/**
 * Implementación genérica de `IBaseRepository` sobre Mongoose.
 * Cada repositorio concreto define su modelo y las referencias a poblar.
 */
export abstract class MongooseRepository<TEntity, TCreate, TUpdate = Partial<TCreate>>
  implements IBaseRepository<TEntity, TCreate, TUpdate>
{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected constructor(
    protected readonly model: Model<any>,
    protected readonly populate: PopulateOptions[] = [],
    protected readonly defaultSort: Record<string, 1 | -1> = { createdAt: -1 },
  ) {}

  protected toEntity(doc: Serializable): TEntity {
    return doc.toJSON() as TEntity
  }

  protected toEntities(docs: Serializable[]): TEntity[] {
    return docs.map((doc) => this.toEntity(doc))
  }

  async create(data: TCreate): Promise<TEntity> {
    const created = await this.model.create(data as Record<string, unknown>)
    const doc = await this.model.findById(created._id).populate(this.populate).orFail()
    return this.toEntity(doc)
  }

  async findById(id: string): Promise<TEntity | null> {
    if (!isValidObjectId(id)) return null
    const doc = await this.model.findById(id).populate(this.populate)
    return doc ? this.toEntity(doc) : null
  }

  async findOne(filter: Filter): Promise<TEntity | null> {
    const doc = await this.model.findOne(filter).populate(this.populate)
    return doc ? this.toEntity(doc) : null
  }

  async findMany({ filter = {}, page, limit, sort }: FindManyOptions): Promise<FindManyResult<TEntity>> {
    const [docs, total] = await Promise.all([
      this.model
        .find(filter)
        .sort(sort ?? this.defaultSort)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate(this.populate),
      this.model.countDocuments(filter),
    ])
    return { items: this.toEntities(docs), total }
  }

  async updateById(id: string, data: TUpdate): Promise<TEntity | null> {
    if (!isValidObjectId(id)) return null
    const doc = await this.model
      .findByIdAndUpdate(id, { $set: data as Record<string, unknown> }, { returnDocument: 'after', runValidators: true })
      .populate(this.populate)
    return doc ? this.toEntity(doc) : null
  }

  async deleteById(id: string): Promise<boolean> {
    if (!isValidObjectId(id)) return false
    const result = await this.model.deleteOne({ _id: id })
    return result.deletedCount === 1
  }

  async exists(filter: Filter): Promise<boolean> {
    return (await this.model.exists(filter)) !== null
  }

  async count(filter: Filter = {}): Promise<number> {
    return this.model.countDocuments(filter)
  }
}
