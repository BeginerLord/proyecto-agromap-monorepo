import { Schema } from 'mongoose'
import { EVIDENCE_TYPES, RECORD_STATUS } from '../../constants/domain.js'

/**
 * Trazabilidad de un registro de bitácora o de cosecha: código único (ACT-xxx / COS-xxx),
 * de dónde sale el dato, si es estimado y con qué evidencia cuenta.
 */
export const recordTraceabilitySchema = new Schema(
  {
    code: { type: String, trim: true },
    /** Nombre original de la labor o de la cosecha (p. ej. "Trasplante a campo", "Primera cosecha"). */
    activity: { type: String, trim: true },
    dataOrigin: { type: String, trim: true },
    estimated: { type: Boolean, default: false },
    recordStatus: { type: String, enum: RECORD_STATUS },
    evidence: { type: String, enum: EVIDENCE_TYPES },
    photoUrl: { type: String, trim: true },
  },
  { _id: false },
)
