import { fieldLogsApi } from '@/api'
import type { FieldLogPayload, FieldLogQuery } from '@/models'

export const fieldLogService = {
  list: (query: FieldLogQuery) => fieldLogsApi.list(query),
  create: (payload: FieldLogPayload) => fieldLogsApi.create({ ...payload, description: payload.description.trim() }),
  remove: (id: string) => fieldLogsApi.remove(id),
}
