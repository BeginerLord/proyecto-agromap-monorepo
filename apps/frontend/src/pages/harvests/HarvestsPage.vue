<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue'
import HarvestFormModal from '@/components/harvests/HarvestFormModal.vue'
import { BaseBadge, BaseButton, BaseCard, BasePagination, EmptyState, PageHeader, ProgressBar } from '@/components/ui'
import { usePaginatedList } from '@/composables/usePaginatedList'
import { HARVEST_QUALITY, ROLE_GROUPS } from '@/constants'
import type { Crop, Harvest, HarvestQuery } from '@/models'
import { cropService, harvestService } from '@/services'
import { useAuthStore } from '@/stores/auth.store'
import { formatDate, formatKg } from '@/utils/format'

const auth = useAuthStore()
const canField = computed(() => auth.hasRole(ROLE_GROUPS.FIELD_TEAM))
const crops = shallowRef<Crop[]>([])
const formOpen = ref(false)

const { items, meta, loading, filters, page, load } = usePaginatedList<Harvest, HarvestQuery>(
  (query) => harvestService.list({ ...query, onlyAvailable: query.onlyAvailable || undefined }),
  { onlyAvailable: false },
)

onMounted(async () => {
  await load()
  if (canField.value) crops.value = await cropService.all()
})
</script>

<template>
  <div>
    <PageHeader eyebrow="Producción" title="Cosechas" description="Kilos cosechados y disponibles para entregar en las jornadas de apoyo.">
      <template #actions>
        <label class="toggle">
          <input v-model="filters.onlyAvailable" type="checkbox" />
          <span>Solo con disponibilidad</span>
        </label>
        <BaseButton v-if="canField" icon="plus" @click="formOpen = true">Registrar cosecha</BaseButton>
      </template>
    </PageHeader>

    <BaseCard padding="none">
      <EmptyState v-if="!loading && !items.length" icon="basket" title="Aún no hay cosechas registradas" />
      <div v-else class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Cultivo</th>
              <th>Predio</th>
              <th>Calidad</th>
              <th>Cosechado</th>
              <th style="width: 220px">Disponible</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="harvest in items" :key="harvest.id">
              <td>{{ formatDate(harvest.harvestedAt) }}</td>
              <td><strong>{{ harvest.crop.species }}</strong></td>
              <td class="muted">{{ harvest.plot.name }}</td>
              <td>
                <BaseBadge :tone="HARVEST_QUALITY[harvest.quality].tone">{{ HARVEST_QUALITY[harvest.quality].label }}</BaseBadge>
              </td>
              <td class="num">{{ formatKg(harvest.quantityKg) }}</td>
              <td>
                <div class="avail">
                  <ProgressBar :value="harvestService.availableRatio(harvest)" tone="sun" />
                  <span class="num">{{ formatKg(harvest.availableKg) }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div style="padding: 0 var(--space-4) var(--space-4)"><BasePagination v-model="page" :meta="meta" /></div>
    </BaseCard>

    <HarvestFormModal v-model:open="formOpen" :crops="crops" @saved="load" />
  </div>
</template>

<style scoped>
.table-wrap {
  overflow-x: auto;
}
.avail {
  display: grid;
  grid-template-columns: 1fr 70px;
  align-items: center;
  gap: var(--space-3);
  text-align: right;
}
.toggle {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--ink-2);
  cursor: pointer;
}
.toggle input {
  accent-color: var(--leaf-700);
  width: 16px;
  height: 16px;
}
</style>
