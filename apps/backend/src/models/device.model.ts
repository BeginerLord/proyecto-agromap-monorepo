import { Schema, model, type InferSchemaType } from 'mongoose'
import { DEVICE_STATUS } from '../constants/domain.js'
import { toJSONPlugin } from './plugins/to-json.plugin.js'

/**
 * Dispositivo de campo. Esquema flexible (`kind`, `metrics`, `metadata`) porque los
 * sensores aún no están definidos; cada adapter decide qué guardar aquí.
 */
const deviceSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    provider: { type: String, required: true, index: true },
    externalId: { type: String, required: true, trim: true },
    kind: { type: String, trim: true },
    metrics: { type: [String], default: [] },
    plot: { type: Schema.Types.ObjectId, ref: 'Plot' },
    crop: { type: Schema.Types.ObjectId, ref: 'Crop' },
    status: { type: String, enum: DEVICE_STATUS, default: 'unknown' },
    lastSeenAt: { type: Date },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true, collection: 'devices' },
)

deviceSchema.plugin(toJSONPlugin)
deviceSchema.index({ provider: 1, externalId: 1 }, { unique: true })

export type DeviceDocument = InferSchemaType<typeof deviceSchema>
export const DeviceModel = model('Device', deviceSchema)
