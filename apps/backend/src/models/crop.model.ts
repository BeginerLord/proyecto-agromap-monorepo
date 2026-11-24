import { Schema, model, type InferSchemaType } from 'mongoose'
import { CROP_STATUS, EVIDENCE_TYPES } from '../constants/domain.js'
import { toJSONPlugin } from './plugins/to-json.plugin.js'

/** Fuente bibliográfica que respalda el ciclo de referencia del cultivo. */
const sourceSchema = new Schema(
  {
    data: { type: String, required: true, trim: true },
    source: { type: String, required: true, trim: true },
    url: { type: String, trim: true },
  },
  { _id: false },
)

/** Hito del cronograma de referencia (fecha o periodo y qué se debe registrar). */
const milestoneSchema = new Schema(
  {
    period: { type: String, required: true, trim: true },
    startDate: { type: Date },
    endDate: { type: Date },
    milestone: { type: String, required: true, trim: true },
    requiredRecord: { type: String, trim: true },
    infoType: { type: String, trim: true },
  },
  { _id: false },
)

/** Datos de trazabilidad del lote (código, cantidades, supuestos, evidencia y fuentes). */
const cropTraceabilitySchema = new Schema(
  {
    lotCode: { type: String, trim: true },
    initialQuantity: { type: Number, min: 0 },
    quantityUnit: { type: String, trim: true },
    sowingMethod: { type: String, trim: true },
    firstHarvestAt: { type: Date },
    harvestEndAt: { type: Date },
    cycleReference: { type: String, trim: true },
    statusNote: { type: String, trim: true },
    evidence: { type: String, enum: EVIDENCE_TYPES },
    sources: { type: [sourceSchema], default: undefined },
    schedule: { type: [milestoneSchema], default: undefined },
  },
  { _id: false },
)

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
    traceability: { type: cropTraceabilitySchema },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, collection: 'crops' },
)

cropSchema.plugin(toJSONPlugin)
cropSchema.index({ 'traceability.lotCode': 1 }, { unique: true, sparse: true })

export type CropDocument = InferSchemaType<typeof cropSchema>
export const CropModel = model('Crop', cropSchema)
