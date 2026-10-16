import { Schema, model, type InferSchemaType } from 'mongoose'
import { PLOT_STATUS, SUN_EXPOSURE, WATER_ACCESS } from '../constants/domain.js'
import { toJSONPlugin } from './plugins/to-json.plugin.js'

const pointSchema = new Schema(
  {
    type: { type: String, enum: ['Point'], required: true, default: 'Point' },
    coordinates: { type: [Number], required: true }, // [lng, lat]
  },
  { _id: false },
)

const polygonSchema = new Schema(
  {
    type: { type: String, enum: ['Polygon'], required: true },
    coordinates: { type: [[[Number]]], required: true },
  },
  { _id: false },
)

const plotSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    owner: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, trim: true },
    },
    location: {
      municipality: { type: String, required: true, default: 'Cereté', trim: true },
      district: { type: String, required: true, trim: true, index: true },
      address: { type: String, trim: true },
      point: { type: pointSchema, required: true },
    },
    boundary: { type: polygonSchema },
    areaM2: { type: Number, min: 0 },
    characterization: {
      soilType: { type: String, trim: true },
      waterAccess: { type: String, enum: WATER_ACCESS },
      sunExposure: { type: String, enum: SUN_EXPOSURE },
      landUseHistory: { type: String, trim: true },
      notes: { type: String, trim: true },
    },
    status: { type: String, enum: PLOT_STATUS, default: 'active', index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, collection: 'plots', minimize: false },
)

plotSchema.plugin(toJSONPlugin)
plotSchema.index({ 'location.point': '2dsphere' })

export type PlotDocument = InferSchemaType<typeof plotSchema>
export const PlotModel = model('Plot', plotSchema)
