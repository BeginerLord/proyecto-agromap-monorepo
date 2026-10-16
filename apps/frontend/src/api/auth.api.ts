import type { LoginPayload, RegisterPayload, User } from '@/models'
import { request } from './http'

interface AuthResponse {
  user: User
}

export const authApi = {
  login: (payload: LoginPayload) => request.post<AuthResponse>('/auth/login', payload),
  register: (payload: RegisterPayload) => request.post<AuthResponse>('/auth/register', payload),
  refresh: () => request.post<AuthResponse>('/auth/refresh'),
  me: () => request.get<AuthResponse>('/auth/me'),
  logout: () => request.post<{ message: string }>('/auth/logout'),
}
