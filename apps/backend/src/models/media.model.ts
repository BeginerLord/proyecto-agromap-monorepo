import { Schema, model, type InferSchemaType } from 'mongoose'
import { toJSONPlugin } from './plugins/to-json.plugin.js'

/** Evidencia fotográfica asociada a un predio, un cultivo y/o una jornada. */
const mediaSchema = new Schema(
  {
    url: { type: String, required: true },
    storageKey: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true, min: 0 },
    caption: { type: String, trim: true, maxlength: 200 },
    plot: { type: Schema.Types.ObjectId, ref: 'Plot', index: true },
    crop: { type: Schema.Types.ObjectId, ref: 'Crop', index: true },
    distribution: { type: Schema.Types.ObjectId, ref: 'Distribution', index: true },
    isPublic: { type: Boolean, default: true, index: true },
    takenAt: { type: Date },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true, collection: 'media' },
)

mediaSchema.plugin(toJSONPlugin)
mediaSchema.index({ createdAt: -1 })

export type MediaDocument = InferSchemaType<typeof mediaSchema>
export const MediaModel = model('Media', mediaSchema)
