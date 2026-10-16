import { usersApi } from '@/api'
import type { UpdateUserPayload, UserQuery } from '@/models'

export const userService = {
  list: (query: UserQuery) => usersApi.list(query),
  update: (id: string, payload: UpdateUserPayload) => usersApi.update(id, payload),
}
