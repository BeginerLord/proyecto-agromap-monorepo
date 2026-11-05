import { Schema, model, type InferSchemaType } from 'mongoose'
import { COMMENT_AUTHOR_ROLES, COMMENT_STATUS } from '../constants/domain.js'
import { toJSONPlugin } from './plugins/to-json.plugin.js'

/** Experiencias enviadas desde el sitio público. Se publican solo tras moderación. */
const commentSchema = new Schema(
  {
    authorName: { type: String, required: true, trim: true, maxlength: 80 },
    authorRole: { type: String, enum: COMMENT_AUTHOR_ROLES, default: 'visitor' },
    message: { type: String, required: true, trim: true, maxlength: 800 },
    rating: { type: Number, min: 1, max: 5 },
    plot: { type: Schema.Types.ObjectId, ref: 'Plot' },
    distribution: { type: Schema.Types.ObjectId, ref: 'Distribution' },
    status: { type: String, enum: COMMENT_STATUS, default: 'pending', index: true },
    moderatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    moderatedAt: { type: Date },
    /** Hash de la IP (no la IP en claro) para análisis de abuso. */
    ipHash: { type: String, select: false },
  },
  { timestamps: true, collection: 'comments' },
)

commentSchema.plugin(toJSONPlugin)
commentSchema.index({ status: 1, createdAt: -1 })

export type CommentDocument = InferSchemaType<typeof commentSchema>
export const CommentModel = model('Comment', commentSchema)
