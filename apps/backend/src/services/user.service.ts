import type { UpdateUserDto, UserQueryDto } from '../dtos/index.js'
import { BadRequestException, NotFoundException } from '../exceptions/index.js'
import type { AuthUser } from '../interfaces/common/auth.interface.js'
import type { PaginatedResult } from '../interfaces/common/pagination.interface.js'
import type { User } from '../interfaces/entities/index.js'
import type { IUserRepository } from '../interfaces/repositories/index.js'
import type { IUserService } from '../interfaces/services/index.js'
import { compact, resolvePagination, searchFilter, toPaginated } from '../utils/index.js'

export class UserService implements IUserService {
  constructor(private readonly users: IUserRepository) {}

  async list(query: UserQueryDto): Promise<PaginatedResult<User>> {
    const pagination = resolvePagination(query)
    const filter = {
      ...searchFilter(query.search, ['name', 'email']),
      ...(query.role && { role: query.role }),
    }
    return toPaginated(await this.users.findMany({ ...pagination, filter, sort: { name: 1 } }), pagination)
  }

  async getById(id: string): Promise<User> {
    const user = await this.users.findById(id)
    if (!user) throw new NotFoundException('Usuario', id)
    return user
  }

  async update(id: string, dto: UpdateUserDto, actor: AuthUser): Promise<User> {
    if (actor.id === id && (dto.role !== undefined || dto.isActive === false)) {
      throw new BadRequestException('No puedes cambiar tu propio rol ni desactivarte')
    }
    const user = await this.users.updateById(id, compact(dto))
    if (!user) throw new NotFoundException('Usuario', id)
    if (dto.isActive === false || dto.role !== undefined) await this.users.incrementTokenVersion(id)
    return user
  }
}
