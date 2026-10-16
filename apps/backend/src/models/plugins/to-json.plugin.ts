import type { Schema } from 'mongoose'

/**
 * Normaliza la serialización de todos los modelos:
 * - expone `id` (string) en lugar de `_id`
 * - convierte ObjectIds a string
 * - elimina `__v`
 */
export function toJSONPlugin(schema: Schema): void {
  schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    flattenObjectIds: true,
    transform: (_doc: unknown, ret: Record<string, unknown>) => {
      delete ret._id
      return ret
    },
  })
}
