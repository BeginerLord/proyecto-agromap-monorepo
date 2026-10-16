import { Schema, model, type InferSchemaType } from 'mongoose'
import { HARVEST_QUALITY } from '../constants/domain.js'
import { toJSONPlugin } from './plugins/to-json.plugin.js'

const harvestSchema = new Schema(
  {
    crop: { type: Schema.Types.ObjectId, ref: 'Crop', required: true, index: true },
    plot: { type: Schema.Types.ObjectId, ref: 'Plot', required: true, index: true },
    harvestedAt: { type: Date, required: true, default: () => new Date() },
    quantityKg: { type: Number, required: true, min: 0 },
    availableKg: { type: Number, required: true, min: 0 },
    quality: { type: String, enum: HARVEST_QUALITY, default: 'medium' },
    notes: { type: String, trim: true },
    registeredBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true, collection: 'harvests' },
)

harvestSchema.plugin(toJSONPlugin)
harvestSchema.index({ harvestedAt: -1 })

export type HarvestDocument = InferSchemaType<typeof harvestSchema>
export const HarvestModel = model('Harvest', harvestSchema)
