/** Nombres de rutas centralizados para evitar strings sueltos en la app. */
export const ROUTE_NAMES = {
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
  NOT_FOUND: 'not-found',
} as const

export type RouteName = (typeof ROUTE_NAMES)[keyof typeof ROUTE_NAMES]
