export const ROLES = {
  ADMIN: 'admin',
  AGRONOMIST: 'agronomist',
  FARMER: 'farmer',
  STUDENT: 'student',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const ROLE_VALUES = Object.values(ROLES) as Role[]

/** Grupos de roles reutilizables para la autorización de rutas. */
export const ROLE_GROUPS = {
  MANAGERS: [ROLES.ADMIN, ROLES.AGRONOMIST],
  FIELD_TEAM: [ROLES.ADMIN, ROLES.AGRONOMIST, ROLES.FARMER],
  EVERYONE: ROLE_VALUES,
} as const satisfies Record<string, readonly Role[]>
