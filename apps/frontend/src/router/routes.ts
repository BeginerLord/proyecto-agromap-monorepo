import type { RouteRecordRaw } from 'vue-router'
import { ROLES, ROUTE_NAMES, type Role } from '@/constants'

declare module 'vue-router' {
  interface RouteMeta {
    /** Ruta pública (login/registro). */
    guestOnly?: boolean
    /** Roles permitidos; si se omite, basta con estar autenticado. */
    roles?: Role[]
    title?: string
  }
}

// Las páginas se cargan bajo demanda (code splitting por ruta)
export const routes: RouteRecordRaw[] = [
  {
    path: '/auth',
    component: () => import('@/layouts/AuthLayout.vue'),
    meta: { guestOnly: true },
    children: [
      { path: '', redirect: { name: ROUTE_NAMES.LOGIN } },
      { path: 'login', name: ROUTE_NAMES.LOGIN, component: () => import('@/pages/auth/LoginPage.vue'), meta: { title: 'Iniciar sesión' } },
      { path: 'register', name: ROUTE_NAMES.REGISTER, component: () => import('@/pages/auth/RegisterPage.vue'), meta: { title: 'Crear cuenta' } },
    ],
  },
  {
    path: '/',
    component: () => import('@/layouts/AppLayout.vue'),
    children: [
      { path: '', name: ROUTE_NAMES.DASHBOARD, component: () => import('@/pages/DashboardPage.vue'), meta: { title: 'Resumen' } },
      { path: 'plots', name: ROUTE_NAMES.PLOTS, component: () => import('@/pages/plots/PlotsPage.vue'), meta: { title: 'Predios' } },
      {
        path: 'plots/:id',
        name: ROUTE_NAMES.PLOT_DETAIL,
        component: () => import('@/pages/plots/PlotDetailPage.vue'),
        props: true,
        meta: { title: 'Predio' },
      },
      { path: 'crops', name: ROUTE_NAMES.CROPS, component: () => import('@/pages/crops/CropsPage.vue'), meta: { title: 'Cultivos' } },
      {
        path: 'field-logs',
        name: ROUTE_NAMES.FIELD_LOGS,
        component: () => import('@/pages/field-logs/FieldLogsPage.vue'),
        meta: { title: 'Bitácora' },
      },
      { path: 'harvests', name: ROUTE_NAMES.HARVESTS, component: () => import('@/pages/harvests/HarvestsPage.vue'), meta: { title: 'Cosechas' } },
      {
        path: 'distributions',
        name: ROUTE_NAMES.DISTRIBUTIONS,
        component: () => import('@/pages/distributions/DistributionsPage.vue'),
        meta: { title: 'Jornadas sabatinas' },
      },
      { path: 'sensors', name: ROUTE_NAMES.SENSORS, component: () => import('@/pages/sensors/SensorsPage.vue'), meta: { title: 'Sensores' } },
      {
        path: 'users',
        name: ROUTE_NAMES.USERS,
        component: () => import('@/pages/users/UsersPage.vue'),
        meta: { title: 'Usuarios', roles: [ROLES.ADMIN] },
      },
      { path: ':pathMatch(.*)*', name: ROUTE_NAMES.NOT_FOUND, component: () => import('@/pages/NotFoundPage.vue') },
    ],
  },
]
