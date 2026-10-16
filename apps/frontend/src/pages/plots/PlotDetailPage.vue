<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue'
import { useRouter } from 'vue-router'
import CropFormModal from '@/components/crops/CropFormModal.vue'
import CropProgress from '@/components/crops/CropProgress.vue'
import FieldLogList from '@/components/field-logs/FieldLogList.vue'
import MediaManager from '@/components/media/MediaManager.vue'
import PlotMap from '@/components/map/PlotMap.vue'
import PlotFormModal from '@/components/plots/PlotFormModal.vue'
import { BaseBadge, BaseButton, BaseCard, EmptyState, PageHeader } from '@/components/ui'
import { useAsyncAction } from '@/composables/useAsyncAction'
import { CROP_STATUS, ROLE_GROUPS, ROLES, ROUTE_NAMES, SUN_EXPOSURE, WATER_ACCESS } from '@/constants'
import type { Crop, FieldLog, Plot } from '@/models'
import { cropService, fieldLogService, plotService } from '@/services'
import { useAuthStore } from '@/stores/auth.store'
import { formatArea, formatDate } from '@/utils/format'
import { formatCoords } from '@/utils/geo'

const props = defineProps<{ id: string }>()
const router = useRouter()
const auth = useAuthStore()
const canManage = computed(() => auth.hasRole(ROLE_GROUPS.MANAGERS))
const canField = computed(() => auth.hasRole(ROLE_GROUPS.FIELD_TEAM))

const plot = ref<Plot | null>(null)
const crops = shallowRef<Crop[]>([])
const logs = shallowRef<FieldLog[]>([])
const editOpen = ref(false)
const cropOpen = ref(false)
const { run } = useAsyncAction()

async function load() {
  const [p, c, l] = await Promise.all([
    plotService.get(props.id),
    cropService.all({ plotId: props.id }),
    fieldLogService.list({ plotId: props.id, limit: 6 }),
  ])
  plot.value = p
  crops.value = c
  logs.value = l.data
}

async function remove() {
  if (!plot.value || !confirm(`¿Eliminar el predio "${plot.value.name}"?`)) return
  const done = await run(() => plotService.remove(props.id).then(() => true), 'Predio eliminado')
  if (done) await router.push({ name: ROUTE_NAMES.PLOTS })
}

onMounted(() => run(load))

const facts = computed(() => {
  if (!plot.value) return []
  const c = plot.value.characterization
  return [
    { label: 'Corregimiento', value: plot.value.location.district },
    { label: 'Propietario', value: plot.value.owner.name },
    { label: 'Área', value: formatArea(plot.value.areaM2) },
    { label: 'Coordenadas', value: formatCoords(plot.value.location.point) },
    { label: 'Tipo de suelo', value: c.soilType ?? '—' },
    { label: 'Acceso a agua', value: c.waterAccess ? WATER_ACCESS[c.waterAccess] : '—' },
    { label: 'Exposición solar', value: c.sunExposure ? SUN_EXPOSURE[c.sunExposure] : '—' },
    { label: 'Historial de uso', value: c.landUseHistory ?? '—' },
  ]
})
</script>

<template>
  <div v-if="plot">
    <RouterLink :to="{ name: ROUTE_NAMES.PLOTS }" class="faint back">← Predios</RouterLink>
    <PageHeader :eyebrow="`${plot.location.municipality} · ${plot.location.district}`" :title="plot.name" :description="plot.characterization.notes">
      <template #actions>
        <BaseButton v-if="auth.hasRole([ROLES.ADMIN])" variant="danger" icon="trash" @click="remove">Eliminar</BaseButton>
        <BaseButton v-if="canManage" variant="secondary" icon="edit" @click="editOpen = true">Editar</BaseButton>
        <BaseButton v-if="canField" icon="plus" @click="cropOpen = true">Nuevo cultivo</BaseButton>
      </template>
    </PageHeader>

    <div class="detail">
      <div class="stack">
        <PlotMap :plots="[plot]" :selected-id="plot.id" height="300px" />
        <BaseCard leaf>
          <template #header><h3>Caracterización</h3></template>
          <dl class="facts">
            <div v-for="fact in facts" :key="fact.label">
              <dt class="faint">{{ fact.label }}</dt>
              <dd>{{ fact.value }}</dd>
            </div>
          </dl>
        </BaseCard>
      </div>

      <div class="stack">
        <BaseCard>
          <template #header>
            <h3>Cultivos <span class="faint num">({{ crops.length }})</span></h3>
          </template>
          <EmptyState v-if="!crops.length" title="Sin cultivos" description="Agrega un cultivo de ciclo corto para este predio." />
          <ul v-else class="crops">
            <li v-for="crop in crops" :key="crop.id" class="crop">
              <div class="row row--between">
                <strong>{{ cropService.label(crop) }}</strong>
                <BaseBadge :tone="CROP_STATUS[crop.status].tone">{{ CROP_STATUS[crop.status].label }}</BaseBadge>
              </div>
              <span class="faint">Siembra {{ formatDate(crop.plantedAt) }}<template v-if="crop.plantCount"> · {{ crop.plantCount }} plantas</template></span>
              <CropProgress :crop="crop" />
            </li>
          </ul>
        </BaseCard>

        <BaseCard>
          <template #header><h3>Bitácora del predio</h3></template>
          <FieldLogList v-if="logs.length" :logs="logs" />
          <EmptyState v-else icon="notebook" title="Sin registros" />
        </BaseCard>
      </div>
    </div>

    <BaseCard class="evidence">
      <template #header>
        <div>
          <h3>Evidencias fotográficas</h3>
          <p class="faint">Las fotos públicas se muestran en la ficha del predio en el sitio público.</p>
        </div>
      </template>
      <MediaManager :owner="{ plotId: plot.id }" :can-edit="canField" />
    </BaseCard>

    <PlotFormModal v-model:open="editOpen" :plot="plot" @saved="load" />
    <CropFormModal v-model:open="cropOpen" :plots="[plot]" :default-plot-id="plot.id" @saved="load" />
  </div>
</template>

<style scoped>
.evidence {
  margin-top: var(--space-6);
}
.back {
  display: inline-block;
  margin-bottom: var(--space-3);
}
.detail {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr);
  gap: var(--space-6);
  align-items: start;
}
.facts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-4);
  margin: 0;
}
.facts dd {
  margin: 2px 0 0;
  font-weight: 500;
}
.crops {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}
.crop {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
@media (max-width: 1080px) {
  .detail {
    grid-template-columns: 1fr;
  }
}
</style>
