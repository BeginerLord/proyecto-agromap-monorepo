import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { onSessionExpired } from '@/api'
import type { Role } from '@/constants/roles'
import type { LoginPayload, RegisterPayload, User } from '@/models'
import { authService } from '@/services'

/**
 * Estado de sesión. El JWT vive en cookies httpOnly: aquí solo se guarda el perfil
 * del usuario devuelto por la API, nunca el token.
 */
export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const initialized = ref(false)
  let initPromise: Promise<void> | null = null

  const isAuthenticated = computed(() => user.value !== null)
  const hasRole = (roles: readonly Role[]) => !!user.value && roles.includes(user.value.role)

  /** Se ejecuta una sola vez (guard del router) para recuperar la sesión desde la cookie. */
  function init(): Promise<void> {
    initPromise ??= authService.currentUser().then((current) => {
      user.value = current
      initialized.value = true
    })
    return initPromise
  }

  async function login(payload: LoginPayload) {
    user.value = await authService.login(payload)
  }

  async function register(payload: RegisterPayload) {
    user.value = await authService.register(payload)
  }

  async function logout() {
    await authService.logout()
    user.value = null
  }

  onSessionExpired(() => {
    user.value = null
  })

  return { user, initialized, isAuthenticated, hasRole, init, login, register, logout }
})
