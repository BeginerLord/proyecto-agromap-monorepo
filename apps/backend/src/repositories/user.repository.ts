import { isValidObjectId } from 'mongoose'
import type { UserWithSecrets, User } from '../interfaces/entities/index.js'
import type { CreateUserData, IUserRepository, UpdateUserData } from '../interfaces/repositories/index.js'
import { UserModel } from '../models/index.js'
import { MongooseRepository } from './base.repository.js'

const SECRET_FIELDS = '+passwordHash +tokenVersion'

export class UserRepository extends MongooseRepository<User, CreateUserData, UpdateUserData> implements IUserRepository {
  constructor() {
    super(UserModel)
  }

  async findByEmailWithSecrets(email: string): Promise<UserWithSecrets | null> {
    const doc = await UserModel.findOne({ email: email.toLowerCase() }).select(SECRET_FIELDS)
    return doc ? (doc.toJSON() as unknown as UserWithSecrets) : null
  }

  async findByIdWithSecrets(id: string): Promise<UserWithSecrets | null> {
    if (!isValidObjectId(id)) return null
    const doc = await UserModel.findById(id).select(SECRET_FIELDS)
    return doc ? (doc.toJSON() as unknown as UserWithSecrets) : null
  }

  async incrementTokenVersion(id: string): Promise<void> {
    await UserModel.updateOne({ _id: id }, { $inc: { tokenVersion: 1 } })
  }
}
