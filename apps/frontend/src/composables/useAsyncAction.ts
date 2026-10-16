import { ref } from 'vue'
import { ApiError } from '@/api'
import { useToastStore } from '@/stores/toast.store'

/**
 * Envuelve una acción asíncrona (guardar, eliminar...) con estado de carga,
 * errores por campo y notificaciones.
 */
export function useAsyncAction() {
  const toast = useToastStore()
  const pending = ref(false)
  const error = ref<string | null>(null)
  const fieldErrors = ref<Record<string, string>>({})

  async function run<T>(action: () => Promise<T>, successMessage?: string): Promise<T | undefined> {
    pending.value = true
    error.value = null
    fieldErrors.value = {}
    try {
      const result = await action()
      if (successMessage) toast.success(successMessage)
      return result
    } catch (err) {
      error.value = (err as Error).message
      if (err instanceof ApiError) {
        for (const detail of err.details ?? []) {
          if (detail.field) fieldErrors.value[detail.field.replace(/^\//, '').replace(/\//g, '.')] = detail.message ?? ''
        }
      }
      toast.error(error.value)
      return undefined
    } finally {
      pending.value = false
    }
  }

  return { pending, error, fieldErrors, run }
}
