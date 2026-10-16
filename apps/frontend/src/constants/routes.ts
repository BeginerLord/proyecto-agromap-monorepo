/** Nombres de rutas centralizados para evitar strings sueltos en la app. */
export const ROUTE_NAMES = {
  // Sitio público
  HOME: 'home',
  PUBLIC_PLOTS: 'public-plots',
  PUBLIC_PLOT: 'public-plot',
  PUBLIC_DISTRIBUTIONS: 'public-distributions',
  PUBLIC_EXPERIENCES: 'public-experiences',
  // Autenticación y panel
  LOGIN: 'login',
  REGISTER: 'register',
  DASHBOARD: 'dashboard',
  PLOTS: 'plots',
  PLOT_DETAIL: 'plot-detail',
  CROPS: 'crops',
  FIELD_LOGS: 'field-logs',
  HARVESTS: 'harvests',
  DISTRIBUTIONS: 'distributions',
  SENSORS: 'sensors',
  USERS: 'users',
  COMMENTS: 'comments',
  NOT_FOUND: 'not-found',
} as const

export type RouteName = (typeof ROUTE_NAMES)[keyof typeof ROUTE_NAMES]
