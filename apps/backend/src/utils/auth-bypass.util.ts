import { ROLES } from '../constants/roles.js'
import type { AuthUser } from '../interfaces/common/auth.interface.js'
import { UserModel } from '../models/index.js'

let cached: AuthUser | null = null

/**
 * Modo temporal sin login (AUTH_BYPASS=true): las peticiones sin sesión se atribuyen
 * al primer administrador activo, para que los registros conserven un autor válido.
 */
export async function resolveBypassUser(): Promise<AuthUser | null> {
  if (cached) return cached
  const admin = await UserModel.findOne({ role: ROLES.ADMIN, isActive: true }).sort({ createdAt: 1 })
  if (!admin) return null
  cached = { id: admin.id as string, name: admin.name, email: admin.email, role: ROLES.ADMIN }
  return cached
}
