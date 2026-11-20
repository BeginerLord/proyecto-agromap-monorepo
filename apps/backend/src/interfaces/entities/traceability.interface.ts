import type { EvidenceType, RecordStatus } from '../../constants/domain.js'

/** Fuente bibliográfica que respalda el ciclo de referencia de un cultivo. */
export interface TraceabilitySource {
  data: string
  source: string
  url?: string
}

/** Hito del cronograma de referencia. */
export interface TraceabilityMilestone {
  period: string
  startDate?: Date
  endDate?: Date
  milestone: string
  requiredRecord?: string
  infoType?: string
}

/** Trazabilidad del lote sembrado (hoja Cultivos_Lotes). */
export interface CropTraceability {
  lotCode?: string
  initialQuantity?: number
  quantityUnit?: string
  sowingMethod?: string
  /** Fecha real de la primera cosecha, si se conoce. */
  firstHarvestAt?: Date
  /** Fin estimado de la ventana de cosecha. */
  harvestEndAt?: Date
  cycleReference?: string
  statusNote?: string
  evidence?: EvidenceType
  sources?: TraceabilitySource[]
  schedule?: TraceabilityMilestone[]
}

/** Trazabilidad de un registro de bitácora (ACT-xxx) o de cosecha (COS-xxx). */
export interface RecordTraceability {
  code?: string
  activity?: string
  dataOrigin?: string
  estimated?: boolean
  recordStatus?: RecordStatus
  evidence?: EvidenceType
  photoUrl?: string
}
