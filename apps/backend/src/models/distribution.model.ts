import { Schema, model, type InferSchemaType } from 'mongoose'
import { toJSONPlugin } from './plugins/to-json.plugin.js'

const distributionItemSchema = new Schema(
  {
    harvest: { type: Schema.Types.ObjectId, ref: 'Harvest', required: true },
    species: { type: String, required: true },
    quantityKg: { type: Number, required: true, min: 0 },
  },
  { _id: false },
)

const distributionSchema = new Schema(
  {
    date: { type: Date, required: true, index: true },
    title: { type: String, required: true, trim: true },
    items: { type: [distributionItemSchema], default: [] },
    totalKg: { type: Number, required: true, min: 0 },
    beneficiaries: { type: Number, required: true, min: 0 },
    notes: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true, collection: 'distributions' },
)

distributionSchema.plugin(toJSONPlugin)

export type DistributionDocument = InferSchemaType<typeof distributionSchema>
export const DistributionModel = model('Distribution', distributionSchema)
