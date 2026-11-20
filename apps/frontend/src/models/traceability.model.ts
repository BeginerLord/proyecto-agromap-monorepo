import type { ISODate } from './common.model'

export type EvidenceType = 'photo' | 'testimony' | 'none'
export type RecordStatus = 'pending' | 'to_verify' | 'verified'

export interface TraceabilitySource {
  data: string
  source: string
  url?: string
}

export interface TraceabilityMilestone {
  period: string
  startDate?: ISODate
  endDate?: ISODate
  milestone: string
  requiredRecord?: string
  infoType?: string
}

/** Trazabilidad del lote: código AGR, cantidades, supuestos, evidencia y fuentes. */
export interface CropTraceability {
  lotCode?: string
  initialQuantity?: number
  quantityUnit?: string
  sowingMethod?: string
  firstHarvestAt?: ISODate
  harvestEndAt?: ISODate
  cycleReference?: string
  statusNote?: string
  evidence?: EvidenceType
  sources?: TraceabilitySource[]
  schedule?: TraceabilityMilestone[]
}

/** Trazabilidad de un registro de bitácora (ACT) o de cosecha (COS). */
export interface RecordTraceability {
  code?: string
  activity?: string
  dataOrigin?: string
  estimated?: boolean
  recordStatus?: RecordStatus
  evidence?: EvidenceType
  photoUrl?: string
}
