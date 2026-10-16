import { authApi } from '@/api'
import type { LoginPayload, RegisterPayload, User } from '@/models'

export const authService = {
  async login(payload: LoginPayload): Promise<User> {
    return (await authApi.login({ ...payload, email: payload.email.trim().toLowerCase() })).user
  },

  async register(payload: RegisterPayload): Promise<User> {
    return (await authApi.register({ ...payload, name: payload.name.trim(), email: payload.email.trim() })).user
  },

  /** Recupera la sesión desde la cookie (si existe). Devuelve null si no hay sesión. */
  async currentUser(): Promise<User | null> {
    try {
      return (await authApi.me()).user
    } catch {
      return null
    }
  },

  async logout(): Promise<void> {
    await authApi.logout().catch(() => undefined)
  },
}
