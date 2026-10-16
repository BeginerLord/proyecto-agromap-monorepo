import Type, { type Static, type TSchema } from 'typebox'
import { PAGINATION } from '../constants/domain.js'

/** Enum de strings compatible con JSON Schema / OpenAPI. */
export const StringEnum = <const T extends readonly string[]>(values: T, options: Record<string, unknown> = {}) =>
  Type.Unsafe<T[number]>({ type: 'string', enum: [...values], ...options })

export const ObjectId = Type.String({ pattern: '^[a-fA-F0-9]{24}$', description: 'ObjectId de MongoDB' })
/** Fecha ISO-8601 recibida en requests (string). */
export const DateTimeInput = Type.String({ format: 'date-time' })
/** Fecha en respuestas: las entidades usan `Date` y el serializador la convierte a ISO-8601. */
export const DateTime = Type.Unsafe<Date | string>({ type: 'string', format: 'date-time' })

export const IdParamDto = Type.Object({ id: ObjectId })
export type IdParamDto = Static<typeof IdParamDto>

export const PaginationQueryDto = Type.Object({
  page: Type.Optional(Type.Integer({ minimum: 1, default: PAGINATION.DEFAULT_PAGE })),
  limit: Type.Optional(Type.Integer({ minimum: 1, maximum: PAGINATION.MAX_LIMIT, default: PAGINATION.DEFAULT_LIMIT })),
  search: Type.Optional(Type.String({ maxLength: 120 })),
})
export type PaginationQueryDto = Static<typeof PaginationQueryDto>

export const PaginationMetaDto = Type.Object({
  page: Type.Integer(),
  limit: Type.Integer(),
  total: Type.Integer(),
  totalPages: Type.Integer(),
})

export const Paginated = <T extends TSchema>(item: T) =>
  Type.Object({ data: Type.Array(item), meta: PaginationMetaDto })

export const ErrorResponseDto = Type.Object({
  statusCode: Type.Integer(),
  error: Type.String(),
  message: Type.String(),
  details: Type.Optional(Type.Unknown()),
})

export const MessageResponseDto = Type.Object({ message: Type.String() })

// Referencias pobladas
export const UserRefDto = Type.Object({ id: Type.String(), name: Type.String() })
export const PlotRefDto = Type.Object({ id: Type.String(), name: Type.String() })
export const CropRefDto = Type.Object({
  id: Type.String(),
  species: Type.String(),
  variety: Type.Optional(Type.String()),
})

export const TimestampsDto = {
  createdAt: DateTime,
  updatedAt: DateTime,
}

/** Respuestas de error estándar para documentar en OpenAPI. */
export const errorResponses = {
  400: ErrorResponseDto,
  401: ErrorResponseDto,
  403: ErrorResponseDto,
  404: ErrorResponseDto,
  409: ErrorResponseDto,
} as const
