import { Schema, model, type InferSchemaType } from 'mongoose'
import { FIELD_LOG_SOURCES, FIELD_LOG_TYPES } from '../constants/domain.js'
import { toJSONPlugin } from './plugins/to-json.plugin.js'

const fieldLogSchema = new Schema(
  {
    crop: { type: Schema.Types.ObjectId, ref: 'Crop', required: true, index: true },
    plot: { type: Schema.Types.ObjectId, ref: 'Plot', required: true, index: true },
    date: { type: Date, required: true, default: () => new Date() },
    type: { type: String, enum: FIELD_LOG_TYPES, required: true },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    photos: { type: [String], default: [] },
    /** Obligatorio solo en registros manuales; los generados por sensores no tienen autor humano. */
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: function (this: { source?: string }) {
        return this.source !== 'sensor'
      },
    },
    source: { type: String, enum: FIELD_LOG_SOURCES, default: 'manual', index: true },
    /** Datos de la lectura que originó una alerta automática. */
    sensor: {
      type: new Schema(
        {
          device: { type: Schema.Types.ObjectId, ref: 'Device', required: true },
          deviceName: { type: String, required: true },
          metric: { type: String, required: true },
          value: { type: Number, required: true },
          unit: { type: String },
          condition: { type: String, enum: ['low', 'high'], required: true },
          threshold: { type: Number, required: true },
          recordedAt: { type: Date, required: true },
        },
        { _id: false },
      ),
    },
  },
  { timestamps: true, collection: 'field_logs' },
)

fieldLogSchema.plugin(toJSONPlugin)
fieldLogSchema.index({ date: -1 })
fieldLogSchema.index({ 'sensor.device': 1, 'sensor.metric': 1, date: -1 })

export type FieldLogDocument = InferSchemaType<typeof fieldLogSchema>
export const FieldLogModel = model('FieldLog', fieldLogSchema)
