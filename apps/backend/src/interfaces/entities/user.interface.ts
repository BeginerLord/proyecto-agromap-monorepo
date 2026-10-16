import type { Role } from '../../constants/roles.js'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  isActive: boolean
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
}

/** Variante interna con campos sensibles. Nunca debe serializarse hacia el cliente. */
export interface UserWithSecrets extends User {
  passwordHash: string
  tokenVersion: number
}
