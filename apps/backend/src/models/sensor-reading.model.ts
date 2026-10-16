import { Schema, model, type InferSchemaType } from 'mongoose'
import { toJSONPlugin } from './plugins/to-json.plugin.js'

/** Lectura normalizada de un sensor. `raw` conserva el payload original del proveedor. */
const sensorReadingSchema = new Schema(
  {
    device: { type: Schema.Types.ObjectId, ref: 'Device', required: true },
    plot: { type: Schema.Types.ObjectId, ref: 'Plot' },
    metric: { type: String, required: true, trim: true },
    value: { type: Number, required: true },
    unit: { type: String, trim: true },
    recordedAt: { type: Date, required: true },
    raw: { type: Schema.Types.Mixed, select: false },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: 'sensor_readings' },
)

sensorReadingSchema.plugin(toJSONPlugin)
sensorReadingSchema.index({ device: 1, metric: 1, recordedAt: -1 })

export type SensorReadingDocument = InferSchemaType<typeof sensorReadingSchema>
export const SensorReadingModel = model('SensorReading', sensorReadingSchema)
