import Type, { type Static } from 'typebox'
import { ROLE_VALUES } from '../constants/roles.js'
import { DateTime, Paginated, PaginationQueryDto, StringEnum, TimestampsDto } from './common.dto.js'

export const RoleDto = StringEnum(ROLE_VALUES)

export const UserResponseDto = Type.Object({
  id: Type.String(),
  name: Type.String(),
  email: Type.String(),
  role: RoleDto,
  isActive: Type.Boolean(),
  lastLoginAt: Type.Optional(DateTime),
  ...TimestampsDto,
})

export const UserListResponseDto = Paginated(UserResponseDto)

export const UserQueryDto = Type.Object({
  ...PaginationQueryDto.properties,
  role: Type.Optional(RoleDto),
})
export type UserQueryDto = Static<typeof UserQueryDto>

export const UpdateUserDto = Type.Object(
  {
    name: Type.Optional(Type.String({ minLength: 2, maxLength: 120 })),
    role: Type.Optional(RoleDto),
    isActive: Type.Optional(Type.Boolean()),
  },
  { additionalProperties: false, minProperties: 1 },
)
export type UpdateUserDto = Static<typeof UpdateUserDto>
