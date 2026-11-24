import Type from 'typebox'
import { EVIDENCE_TYPES, RECORD_STATUS } from '../constants/domain.js'
import { DateTime, StringEnum } from './common.dto.js'

export const EvidenceTypeDto = StringEnum(EVIDENCE_TYPES)
export const RecordStatusDto = StringEnum(RECORD_STATUS)

export const CropTraceabilityDto = Type.Object({
  lotCode: Type.Optional(Type.String()),
  initialQuantity: Type.Optional(Type.Number()),
  quantityUnit: Type.Optional(Type.String()),
  sowingMethod: Type.Optional(Type.String()),
  firstHarvestAt: Type.Optional(DateTime),
  harvestEndAt: Type.Optional(DateTime),
  cycleReference: Type.Optional(Type.String()),
  statusNote: Type.Optional(Type.String()),
  evidence: Type.Optional(EvidenceTypeDto),
  sources: Type.Optional(
    Type.Array(Type.Object({ data: Type.String(), source: Type.String(), url: Type.Optional(Type.String()) })),
  ),
  schedule: Type.Optional(
    Type.Array(
      Type.Object({
        period: Type.String(),
        startDate: Type.Optional(DateTime),
        endDate: Type.Optional(DateTime),
        milestone: Type.String(),
        requiredRecord: Type.Optional(Type.String()),
        infoType: Type.Optional(Type.String()),
      }),
    ),
  ),
})

export const RecordTraceabilityDto = Type.Object({
  code: Type.Optional(Type.String()),
  activity: Type.Optional(Type.String()),
  dataOrigin: Type.Optional(Type.String()),
  estimated: Type.Optional(Type.Boolean()),
  recordStatus: Type.Optional(RecordStatusDto),
  evidence: Type.Optional(EvidenceTypeDto),
  photoUrl: Type.Optional(Type.String()),
})
