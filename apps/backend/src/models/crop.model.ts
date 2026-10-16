import { Schema, model, type InferSchemaType } from 'mongoose'
import { CROP_STATUS } from '../constants/domain.js'
import { toJSONPlugin } from './plugins/to-json.plugin.js'

const cropSchema = new Schema(
  {
    plot: { type: Schema.Types.ObjectId, ref: 'Plot', required: true, index: true },
    species: { type: String, required: true, trim: true, maxlength: 80 },
    variety: { type: String, trim: true, maxlength: 80 },
    status: { type: String, enum: CROP_STATUS, default: 'planned', index: true },
    plantedAt: { type: Date },
    expectedHarvestAt: { type: Date, index: true },
    cycleDays: { type: Number, min: 1 },
    areaM2: { type: Number, min: 0 },
    plantCount: { type: Number, min: 0 },
    notes: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, collection: 'crops' },
)

cropSchema.plugin(toJSONPlugin)

export type CropDocument = InferSchemaType<typeof cropSchema>
export const CropModel = model('Crop', cropSchema)
