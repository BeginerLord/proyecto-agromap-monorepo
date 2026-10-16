import type { Router } from 'vue-router'
import { APP_NAME, ROUTE_NAMES } from '@/constants'
import { useAuthStore } from '@/stores/auth.store'

/** Guards globales: autenticación, roles y título del documento. */
export function registerGuards(router: Router): void {
  router.beforeEach(async (to) => {
    const auth = useAuthStore()
    await auth.init()

    const guestOnly = to.matched.some((record) => record.meta.guestOnly)

    if (guestOnly) {
      return auth.isAuthenticated ? { name: ROUTE_NAMES.DASHBOARD } : true
    }

    if (!auth.isAuthenticated) {
      return { name: ROUTE_NAMES.LOGIN, query: to.fullPath !== '/' ? { redirect: to.fullPath } : undefined }
    }

    const roles = to.meta.roles
    if (roles && !auth.hasRole(roles)) return { name: ROUTE_NAMES.DASHBOARD }

    return true
  })

  router.afterEach((to) => {
    document.title = to.meta.title ? `${to.meta.title} · ${APP_NAME}` : APP_NAME
  })
}
