<script setup lang="ts">
import { onMounted, ref, shallowRef } from 'vue'
import FieldLogFormModal from '@/components/field-logs/FieldLogFormModal.vue'
import FieldLogList from '@/components/field-logs/FieldLogList.vue'
import { BaseButton, BaseCard, BasePagination, BaseSelect, EmptyState, PageHeader, SearchInput } from '@/components/ui'
import { useAsyncAction } from '@/composables/useAsyncAction'
import { usePaginatedList } from '@/composables/usePaginatedList'
import { FIELD_LOG_TYPES, ROLES, toOptions } from '@/constants'
import type { Crop, FieldLog, FieldLogQuery, FieldLogType } from '@/models'
import { cropService, fieldLogService } from '@/services'
import { useAuthStore } from '@/stores/auth.store'

const auth = useAuthStore()
const crops = shallowRef<Crop[]>([])
const formOpen = ref(false)
const { run } = useAsyncAction()

const { items, meta, loading, filters, page, load } = usePaginatedList<FieldLog, FieldLogQuery>(
  (query) => fieldLogService.list({ ...query, type: query.type || undefined }),
  { search: '', type: '' as FieldLogType },
)

const canRemove = (log: FieldLog) => log.author.id === auth.user?.id || auth.hasRole([ROLES.ADMIN])

async function remove(log: FieldLog) {
  if (!confirm('¿Eliminar este registro?')) return
  await run(() => fieldLogService.remove(log.id), 'Registro eliminado')
  await load()
}

onMounted(async () => {
  await load()
  crops.value = await cropService.all()
})
</script>

<template>
  <div>
    <PageHeader
      eyebrow="Fase III · Seguimiento"
      title="Bitácora de campo"
      description="Riegos, fertilizaciones, controles fitosanitarios y observaciones de cada cultivo."
    >
      <template #actions>
        <BaseButton icon="plus" @click="formOpen = true">Nuevo registro</BaseButton>
      </template>
    </PageHeader>

    <BaseCard>
      <div class="filters">
        <SearchInput v-model="filters.search" placeholder="Buscar en descripciones" />
        <BaseSelect v-model="filters.type" :options="toOptions(FIELD_LOG_TYPES)" placeholder="Todas las actividades" />
      </div>
      <EmptyState v-if="!loading && !items.length" icon="notebook" title="Sin registros" description="Agrega la primera actividad de campo." />
      <FieldLogList v-else :logs="items" :removable="canRemove" @remove="remove" />
      <BasePagination v-model="page" :meta="meta" />
    </BaseCard>

    <FieldLogFormModal v-model:open="formOpen" :crops="crops" @saved="load" />
  </div>
</template>

<style scoped>
.filters {
  display: grid;
  grid-template-columns: minmax(240px, 1.5fr) minmax(200px, 1fr);
  gap: var(--space-3);
  margin-bottom: var(--space-6);
}
@media (max-width: 760px) {
  .filters {
    grid-template-columns: 1fr;
  }
}
</style>
