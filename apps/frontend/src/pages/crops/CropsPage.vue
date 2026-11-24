<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue'
import CropFormModal from '@/components/crops/CropFormModal.vue'
import CropProgress from '@/components/crops/CropProgress.vue'
import { BaseBadge, BaseButton, BaseCard, BasePagination, BaseSelect, EmptyState, PageHeader, SearchInput } from '@/components/ui'
import { useAsyncAction } from '@/composables/useAsyncAction'
import { usePaginatedList } from '@/composables/usePaginatedList'
import { CROP_STATUS, EVIDENCE_TYPES, ROLE_GROUPS, toOptions } from '@/constants'
import type { Crop, CropQuery, CropStatus, Plot } from '@/models'
import { cropService, plotService } from '@/services'
import { useAuthStore } from '@/stores/auth.store'
import { formatDate } from '@/utils/format'

const auth = useAuthStore()
const canField = computed(() => auth.hasRole(ROLE_GROUPS.FIELD_TEAM))
const canManage = computed(() => auth.hasRole(ROLE_GROUPS.MANAGERS))

const plots = shallowRef<Plot[]>([])
const { items, meta, loading, filters, page, load } = usePaginatedList<Crop, CropQuery>(
  (query) => cropService.list({ ...query, status: query.status || undefined, plotId: query.plotId || undefined }),
  { search: '', status: '' as CropStatus, plotId: '' },
)
const formOpen = ref(false)
const editing = ref<Crop | null>(null)
const { run } = useAsyncAction()

function openForm(crop: Crop | null = null) {
  editing.value = crop
  formOpen.value = true
}

async function changeStatus(crop: Crop, status: CropStatus) {
  await run(() => cropService.update(crop.id, { status }), 'Estado actualizado')
  await load()
}

async function remove(crop: Crop) {
  if (!confirm(`¿Eliminar el cultivo de ${crop.species}?`)) return
  await run(() => cropService.remove(crop.id), 'Cultivo eliminado')
  await load()
}

const plotOptions = computed(() => plots.value.map((p) => ({ value: p.id, label: p.name })))
const statusOptions = toOptions(CROP_STATUS)

onMounted(async () => {
  await load()
  plots.value = await plotService.all()
})
</script>

<template>
  <div>
    <PageHeader
      eyebrow="Fase II · Planeación"
      title="Cultivos de ciclo corto"
      description="Seguimiento del ciclo de cada cultivo desde la siembra hasta la cosecha."
    >
      <template #actions>
        <BaseButton v-if="canField" icon="plus" @click="openForm()">Nuevo cultivo</BaseButton>
      </template>
    </PageHeader>

    <div class="filters">
      <SearchInput v-model="filters.search" placeholder="Buscar especie o variedad" />
      <BaseSelect v-model="filters.plotId" :options="plotOptions" placeholder="Todos los predios" />
      <BaseSelect v-model="filters.status" :options="statusOptions" placeholder="Todos los estados" />
    </div>

    <EmptyState v-if="!loading && !items.length" title="No hay cultivos" description="Ajusta los filtros o registra un cultivo nuevo." />

    <div class="grid crops-grid">
      <BaseCard v-for="crop in items" :key="crop.id" leaf>
        <div class="crop">
          <div class="row row--between">
            <BaseBadge :tone="CROP_STATUS[crop.status].tone">{{ CROP_STATUS[crop.status].label }}</BaseBadge>
            <span class="faint">{{ crop.plot.name }}</span>
          </div>
          <div v-if="crop.traceability?.lotCode" class="row crop__lot">
            <span class="faint num">{{ crop.traceability.lotCode }}</span>
            <BaseBadge v-if="crop.traceability.evidence" :tone="EVIDENCE_TYPES[crop.traceability.evidence].tone">
              {{ EVIDENCE_TYPES[crop.traceability.evidence].label }}
            </BaseBadge>
          </div>
          <div>
            <h3>{{ crop.species }}</h3>
            <p v-if="crop.variety" class="muted">{{ crop.variety }}</p>
          </div>
          <dl class="crop__facts">
            <div><dt class="faint">Siembra</dt><dd>{{ formatDate(crop.plantedAt) }}</dd></div>
            <div><dt class="faint">Cosecha est.</dt><dd>{{ formatDate(crop.expectedHarvestAt) }}</dd></div>
            <div><dt class="faint">Plantas</dt><dd class="num">{{ crop.plantCount ?? '—' }}</dd></div>
          </dl>
          <CropProgress :crop="crop" />
          <details v-if="crop.traceability" class="crop__trace">
            <summary>Trazabilidad del lote</summary>
            <dl>
              <div v-if="crop.traceability.initialQuantity !== undefined">
                <dt class="faint">Cantidad inicial</dt>
                <dd>{{ crop.traceability.initialQuantity }} · {{ crop.traceability.quantityUnit ?? 'unidad por confirmar' }}</dd>
              </div>
              <div v-if="crop.traceability.sowingMethod"><dt class="faint">Tipo de siembra</dt><dd>{{ crop.traceability.sowingMethod }}</dd></div>
              <div v-if="crop.traceability.firstHarvestAt">
                <dt class="faint">Primera cosecha real</dt><dd>{{ formatDate(crop.traceability.firstHarvestAt) }}</dd>
              </div>
              <div v-if="crop.traceability.harvestEndAt">
                <dt class="faint">Fin de cosecha est.</dt><dd>{{ formatDate(crop.traceability.harvestEndAt) }}</dd>
              </div>
              <div v-if="crop.traceability.cycleReference">
                <dt class="faint">Ciclo de referencia</dt><dd>{{ crop.traceability.cycleReference }}</dd>
              </div>
            </dl>
            <p v-if="crop.notes" class="muted">{{ crop.notes }}</p>
            <template v-if="crop.traceability.sources?.length">
              <strong class="crop__trace-title">Fuentes</strong>
              <ul>
                <li v-for="source in crop.traceability.sources" :key="source.source">
                  <a v-if="source.url" :href="source.url" target="_blank" rel="noopener noreferrer">{{ source.source }}</a>
                  <span v-else>{{ source.source }}</span>
                  <span class="faint"> — {{ source.data }}</span>
                </li>
              </ul>
            </template>
            <template v-if="crop.traceability.schedule?.length">
              <strong class="crop__trace-title">Cronograma de referencia</strong>
              <ul>
                <li v-for="item in crop.traceability.schedule" :key="item.period + item.milestone">
                  <span class="num">{{ item.period }}</span> · {{ item.milestone }}
                  <span v-if="item.infoType" class="faint"> ({{ item.infoType }})</span>
                </li>
              </ul>
            </template>
          </details>
          <div v-if="canField" class="crop__actions">
            <select
              class="crop__status"
              :value="crop.status"
              aria-label="Cambiar estado"
              @change="changeStatus(crop, ($event.target as HTMLSelectElement).value as CropStatus)"
            >
              <option v-for="option in statusOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
            <BaseButton size="sm" variant="ghost" icon="edit" @click="openForm(crop)">Editar</BaseButton>
            <BaseButton v-if="canManage" size="sm" variant="ghost" icon="trash" aria-label="Eliminar" @click="remove(crop)" />
          </div>
        </div>
      </BaseCard>
    </div>

    <BasePagination v-model="page" :meta="meta" />

    <CropFormModal v-model:open="formOpen" :crop="editing" :plots="plots" @saved="load" />
  </div>
</template>

<style scoped>
.filters {
  display: grid;
  grid-template-columns: minmax(240px, 1.4fr) repeat(2, minmax(180px, 1fr));
  gap: var(--space-3);
  margin-bottom: var(--space-6);
}
.crops-grid {
  grid-template-columns: repeat(auto-fill, minmax(min(300px, 100%), 1fr));
}
.crop {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.crop__facts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-2);
  margin: 0;
  font-size: var(--text-sm);
}
.crop__facts dd {
  margin: 0;
  font-weight: 500;
}
.crop__lot {
  gap: var(--space-2);
  margin-top: calc(-1 * var(--space-2));
}
.crop__trace {
  font-size: var(--text-sm);
}
.crop__trace summary {
  cursor: pointer;
  font-weight: 500;
}
.crop__trace dl {
  display: grid;
  gap: var(--space-2);
  margin: var(--space-3) 0;
}
.crop__trace dd {
  margin: 0;
}
.crop__trace ul {
  margin: var(--space-1) 0 var(--space-3);
  padding-left: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
.crop__trace a {
  overflow-wrap: anywhere;
}
.crop__trace-title {
  display: block;
  margin-top: var(--space-2);
}
.crop__actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding-top: var(--space-3);
  border-top: 1px dashed var(--line);
}
.crop__status {
  flex: 1;
  height: 34px;
  padding: 0 var(--space-3);
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-pill);
  background: var(--surface);
  font-size: var(--text-xs);
}
@media (max-width: 760px) {
  .filters {
    grid-template-columns: 1fr;
  }
}
</style>
