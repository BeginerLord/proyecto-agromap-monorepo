import type { RouteRecordRaw } from 'vue-router'
import { ROLE_GROUPS, ROLES, ROUTE_NAMES, type Role } from '@/constants'

declare module 'vue-router' {
  interface RouteMeta {
    /** Ruta solo para invitados (login/registro). */
    guestOnly?: boolean
    /** Requiere sesión iniciada (panel de administración). */
    requiresAuth?: boolean
    /** Roles permitidos; si se omite, basta con estar autenticado. */
    roles?: Role[]
    title?: string
  }
}

// Las páginas se cargan bajo demanda (code splitting por ruta)
export const routes: RouteRecordRaw[] = [
  // ─── Sitio público ──────────────────────────────────────
  {
    path: '/',
    component: () => import('@/layouts/PublicLayout.vue'),
    children: [
      { path: '', name: ROUTE_NAMES.HOME, component: () => import('@/pages/public/PublicHomePage.vue'), meta: { title: 'Inicio' } },
      {
        path: 'puntos',
        name: ROUTE_NAMES.PUBLIC_PLOTS,
        component: () => import('@/pages/public/PublicPlotsPage.vue'),
        meta: { title: 'Puntos periurbanos' },
      },
      {
        path: 'puntos/:id',
        name: ROUTE_NAMES.PUBLIC_PLOT,
        component: () => import('@/pages/public/PublicPlotDetailPage.vue'),
        props: true,
        meta: { title: 'Predio' },
      },
      {
        path: 'jornadas',
        name: ROUTE_NAMES.PUBLIC_DISTRIBUTIONS,
        component: () => import('@/pages/public/PublicDistributionsPage.vue'),
        meta: { title: 'Jornadas de apoyo' },
      },
      {
        path: 'experiencias',
        name: ROUTE_NAMES.PUBLIC_EXPERIENCES,
        component: () => import('@/pages/public/PublicExperiencesPage.vue'),
        meta: { title: 'Experiencias' },
      },
    ],
  },

  // ─── Autenticación ──────────────────────────────────────
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

  // ─── Panel de administración ────────────────────────────
  {
    path: '/panel',
    component: () => import('@/layouts/AppLayout.vue'),
    meta: { requiresAuth: true },
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
        meta: { title: 'Jornadas de apoyo' },
      },
      { path: 'sensors', name: ROUTE_NAMES.SENSORS, component: () => import('@/pages/sensors/SensorsPage.vue'), meta: { title: 'Sensores' } },
      {
        path: 'comments',
        name: ROUTE_NAMES.COMMENTS,
        component: () => import('@/pages/comments/CommentsPage.vue'),
        meta: { title: 'Experiencias', roles: ROLE_GROUPS.MANAGERS },
      },
      {
        path: 'users',
        name: ROUTE_NAMES.USERS,
        component: () => import('@/pages/users/UsersPage.vue'),
        meta: { title: 'Usuarios', roles: [ROLES.ADMIN] },
      },
    ],
  },

  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/layouts/PublicLayout.vue'),
    children: [{ path: '', name: ROUTE_NAMES.NOT_FOUND, component: () => import('@/pages/NotFoundPage.vue') }],
  },
]
