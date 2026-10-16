import { Schema, model, type InferSchemaType } from 'mongoose'
import { FIELD_LOG_TYPES } from '../constants/domain.js'
import { toJSONPlugin } from './plugins/to-json.plugin.js'

const fieldLogSchema = new Schema(
  {
    crop: { type: Schema.Types.ObjectId, ref: 'Crop', required: true, index: true },
    plot: { type: Schema.Types.ObjectId, ref: 'Plot', required: true, index: true },
    date: { type: Date, required: true, default: () => new Date() },
    type: { type: String, enum: FIELD_LOG_TYPES, required: true },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    photos: { type: [String], default: [] },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true, collection: 'field_logs' },
)

fieldLogSchema.plugin(toJSONPlugin)
fieldLogSchema.index({ date: -1 })

export type FieldLogDocument = InferSchemaType<typeof fieldLogSchema>
export const FieldLogModel = model('FieldLog', fieldLogSchema)
