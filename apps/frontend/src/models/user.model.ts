import type { Role } from '@/constants/roles'
import type { ISODate, PaginationQuery, Timestamps } from './common.model'

export interface User extends Timestamps {
  id: string
  name: string
  email: string
  role: Role
  isActive: boolean
  lastLoginAt?: ISODate
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload extends LoginPayload {
  name: string
}

export interface UpdateUserPayload {
  name?: string
  role?: Role
  isActive?: boolean
}

export interface UserQuery extends PaginationQuery {
  role?: Role
}
