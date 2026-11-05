<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue'
import { useRouter } from 'vue-router'
import CropStatusBreakdown from '@/components/dashboard/CropStatusBreakdown.vue'
import HarvestTimeline from '@/components/dashboard/HarvestTimeline.vue'
import StatCard from '@/components/dashboard/StatCard.vue'
import FieldLogList from '@/components/field-logs/FieldLogList.vue'
import PlotMap, { type MapPlot } from '@/components/map/PlotMap.vue'
import { BaseButton, BaseCard, EmptyState, PageHeader } from '@/components/ui'
import { ROUTE_NAMES } from '@/constants'
import type { DashboardSummary, Plot } from '@/models'
import { dashboardService, plotService } from '@/services'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'
import { formatKg, formatNumber } from '@/utils/format'

const auth = useAuthStore()
const toast = useToastStore()
const router = useRouter()
const summary = ref<DashboardSummary | null>(null)
const plots = shallowRef<Plot[]>([])
const loading = ref(true)

const firstName = computed(() => auth.user?.name.split(' ')[0] ?? '')
const openPlot = (plot: MapPlot) => router.push({ name: ROUTE_NAMES.PLOT_DETAIL, params: { id: plot.id } })

onMounted(async () => {
  try {
    ;[summary.value, plots.value] = await Promise.all([dashboardService.summary(), plotService.all()])
  } catch (error) {
    toast.error((error as Error).message)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <PageHeader
      eyebrow="Resumen"
      :title="`Hola, ${firstName}`"
      description="Esto es lo que está pasando en los predios y en las jornadas de apoyo alimentario."
    >
      <template #actions>
        <BaseButton variant="secondary" icon="notebook" @click="router.push({ name: ROUTE_NAMES.FIELD_LOGS })">
          Bitácora
        </BaseButton>
        <BaseButton icon="map" @click="router.push({ name: ROUTE_NAMES.PLOTS })">Ver predios</BaseButton>
      </template>
    </PageHeader>

    <div v-if="summary" class="dashboard">
      <div class="grid grid--4">
        <StatCard label="Predios activos" :value="summary.plots" icon="map" hint="Martínez · Mateo Gómez" />
        <StatCard label="Cultivos" :value="summary.crops.total" icon="sprout" tone="soil" hint="registrados" />
        <StatCard
          label="Disponible para jornadas"
          :value="formatKg(summary.harvest.availableKg)"
          icon="basket"
          tone="sun"
          :hint="`de ${formatKg(summary.harvest.harvestedKg)} cosechados`"
        />
        <StatCard
          label="Estudiantes beneficiados"
          :value="formatNumber(summary.distributions.beneficiaries)"
          icon="users"
          tone="water"
          :hint="`${summary.distributions.count} ${summary.distributions.count === 1 ? 'entrega' : 'entregas'} · ${formatKg(summary.distributions.distributedKg)}`"
        />
      </div>

      <div class="dashboard__main">
        <BaseCard padding="none" class="dashboard__map">
          <PlotMap :plots="plots" height="100%" @select="openPlot" />
        </BaseCard>

        <BaseCard leaf>
          <template #header>
            <div>
              <h3>Próximas cosechas</h3>
              <p class="faint">Qué alimentos estarán disponibles y cuándo</p>
            </div>
          </template>
          <HarvestTimeline :crops="summary.upcomingHarvests" />
        </BaseCard>
      </div>

      <div class="grid grid--2" style="align-items: start">
        <BaseCard>
          <template #header><h3>Estado de los cultivos</h3></template>
          <CropStatusBreakdown v-if="summary.crops.total" :by-status="summary.crops.byStatus" :total="summary.crops.total" />
          <EmptyState v-else title="Aún no hay cultivos" />
        </BaseCard>
        <BaseCard>
          <template #header>
            <h3>Actividad reciente</h3>
            <RouterLink :to="{ name: ROUTE_NAMES.FIELD_LOGS }" class="faint">Ver todo</RouterLink>
          </template>
          <FieldLogList v-if="summary.recentLogs.length" :logs="summary.recentLogs" />
          <EmptyState v-else icon="notebook" title="Sin registros de campo" />
        </BaseCard>
      </div>
    </div>

    <div v-else-if="loading" class="grid grid--4">
      <div v-for="n in 4" :key="n" class="skeleton" />
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}
.dashboard__main {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
  gap: var(--space-6);
}
.dashboard__map {
  min-height: 420px;
  overflow: hidden;
}
.dashboard__map :deep(.plot-map) {
  border: 0;
  border-radius: 0;
  min-height: 420px;
}
.skeleton {
  height: 104px;
  border-radius: var(--radius-lg);
  background: var(--sand);
  animation: pulse 1.4s ease-in-out infinite;
}
@keyframes pulse {
  50% {
    opacity: 0.55;
  }
}
@media (max-width: 1080px) {
  .dashboard__main {
    grid-template-columns: 1fr;
  }
}
</style>
