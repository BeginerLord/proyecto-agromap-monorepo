import Type, { type Static } from 'typebox'
import { COMMENT_AUTHOR_ROLES, COMMENT_STATUS } from '../constants/domain.js'
import {
  DateTime,
  ObjectId,
  Paginated,
  PaginationQueryDto,
  PlotRefDto,
  StringEnum,
  TimestampsDto,
  UserRefDto,
} from './common.dto.js'

export const CommentStatusDto = StringEnum(COMMENT_STATUS)
export const CommentAuthorRoleDto = StringEnum(COMMENT_AUTHOR_ROLES)
const DistributionRefDto = Type.Object({ id: Type.String(), title: Type.String() })

/** Formulario público "Comparte tu experiencia". */
export const CreatePublicCommentDto = Type.Object(
  {
    authorName: Type.String({ minLength: 2, maxLength: 80 }),
    authorRole: Type.Optional(CommentAuthorRoleDto),
    message: Type.String({ minLength: 10, maxLength: 800 }),
    rating: Type.Optional(Type.Integer({ minimum: 1, maximum: 5 })),
    plotId: Type.Optional(ObjectId),
    distributionId: Type.Optional(ObjectId),
    /** Campo trampa (honeypot): debe llegar vacío; los bots suelen llenarlo. */
    website: Type.Optional(Type.String({ maxLength: 200 })),
  },
  { additionalProperties: false },
)
export type CreatePublicCommentDto = Static<typeof CreatePublicCommentDto>

export const CommentQueryDto = Type.Object({
  ...PaginationQueryDto.properties,
  status: Type.Optional(CommentStatusDto),
})
export type CommentQueryDto = Static<typeof CommentQueryDto>

export const ModerateCommentDto = Type.Object({ status: CommentStatusDto }, { additionalProperties: false })
export type ModerateCommentDto = Static<typeof ModerateCommentDto>

export const CommentResponseDto = Type.Object({
  id: Type.String(),
  authorName: Type.String(),
  authorRole: CommentAuthorRoleDto,
  message: Type.String(),
  rating: Type.Optional(Type.Integer()),
  plot: Type.Optional(PlotRefDto),
  distribution: Type.Optional(DistributionRefDto),
  status: CommentStatusDto,
  moderatedBy: Type.Optional(UserRefDto),
  moderatedAt: Type.Optional(DateTime),
  ...TimestampsDto,
})
export const CommentListResponseDto = Paginated(CommentResponseDto)

/** Versión pública: sin datos de moderación. */
export const PublicCommentDto = Type.Object({
  id: Type.String(),
  authorName: Type.String(),
  authorRole: CommentAuthorRoleDto,
  message: Type.String(),
  rating: Type.Optional(Type.Integer()),
  plot: Type.Optional(PlotRefDto),
  distribution: Type.Optional(DistributionRefDto),
  createdAt: DateTime,
})
export const PublicCommentListDto = Paginated(PublicCommentDto)

export const CommentSubmittedDto = Type.Object({ message: Type.String(), status: CommentStatusDto })

export const CommentStatsDto = Type.Record(Type.String(), Type.Integer())
