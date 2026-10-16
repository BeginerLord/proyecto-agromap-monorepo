import Type, { type Static } from 'typebox'
import {
  CropRefDto,
  DateTime,
  ObjectId,
  Paginated,
  PaginationQueryDto,
  PlotRefDto,
  TimestampsDto,
  UserRefDto,
} from './common.dto.js'

export const MediaQueryDto = Type.Object({
  ...PaginationQueryDto.properties,
  plotId: Type.Optional(ObjectId),
  cropId: Type.Optional(ObjectId),
  distributionId: Type.Optional(ObjectId),
})
export type MediaQueryDto = Static<typeof MediaQueryDto>

/** Campos de texto que acompañan al archivo en el multipart/form-data. */
export interface UploadMediaFields {
  caption?: string
  plotId?: string
  cropId?: string
  distributionId?: string
  isPublic?: boolean
  takenAt?: string
}

export const UpdateMediaDto = Type.Object(
  {
    caption: Type.Optional(Type.String({ maxLength: 200 })),
    isPublic: Type.Optional(Type.Boolean()),
  },
  { additionalProperties: false, minProperties: 1 },
)
export type UpdateMediaDto = Static<typeof UpdateMediaDto>

export const MediaResponseDto = Type.Object({
  id: Type.String(),
  url: Type.String(),
  mimeType: Type.String(),
  size: Type.Integer(),
  caption: Type.Optional(Type.String()),
  plot: Type.Optional(PlotRefDto),
  crop: Type.Optional(CropRefDto),
  distribution: Type.Optional(Type.String()),
  isPublic: Type.Boolean(),
  takenAt: Type.Optional(DateTime),
  uploadedBy: UserRefDto,
  ...TimestampsDto,
})
export const MediaListResponseDto = Paginated(MediaResponseDto)
