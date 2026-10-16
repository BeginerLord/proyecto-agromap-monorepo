export const ROLES = {
  ADMIN: 'admin',
  AGRONOMIST: 'agronomist',
  FARMER: 'farmer',
  STUDENT: 'student',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const ROLE_GROUPS = {
  MANAGERS: [ROLES.ADMIN, ROLES.AGRONOMIST] as Role[],
  FIELD_TEAM: [ROLES.ADMIN, ROLES.AGRONOMIST, ROLES.FARMER] as Role[],
}
