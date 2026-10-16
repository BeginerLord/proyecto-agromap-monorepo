import { reactive, ref, shallowRef, watch } from 'vue'
import { PAGE_SIZE } from '@/constants/app'
import type { Paginated, PaginationMeta, PaginationQuery } from '@/models'
import { useToastStore } from '@/stores/toast.store'

/**
 * Estado reutilizable para listados paginados con filtros.
 * Recarga automáticamente cuando cambian los filtros (con debounce en `search`).
 */
export function usePaginatedList<T, Q extends PaginationQuery>(
  fetcher: (query: Q) => Promise<Paginated<T>>,
  initialFilters: Omit<Q, 'page' | 'limit'>,
) {
  const toast = useToastStore()
  const items = shallowRef<T[]>([])
  const meta = ref<PaginationMeta>({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 })
  const loading = ref(false)
  const filters = reactive({ ...initialFilters }) as Omit<Q, 'page' | 'limit'>
  const page = ref(1)

  async function load() {
    loading.value = true
    try {
      const result = await fetcher({ ...filters, page: page.value, limit: PAGE_SIZE } as Q)
      items.value = result.data
      meta.value = result.meta
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      loading.value = false
    }
  }

  let debounce: ReturnType<typeof setTimeout> | undefined
  watch(
    () => ({ ...filters }),
    () => {
      clearTimeout(debounce)
      debounce = setTimeout(() => {
        // Volver a la primera página; si ya estamos en ella, recargar directamente
        if (page.value !== 1) page.value = 1
        else void load()
      }, 280)
    },
    { deep: true },
  )
  watch(page, () => void load())

  return { items, meta, loading, filters, page, load }
}
