<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue'
import { useRouter } from 'vue-router'
import PlotMap, { type MapPlot } from '@/components/map/PlotMap.vue'
import PublicPlotCard from '@/components/public/PublicPlotCard.vue'
import { EmptyState, PageHeader } from '@/components/ui'
import { ROUTE_NAMES } from '@/constants'
import type { PublicPlot } from '@/models'
import { publicService } from '@/services'

const router = useRouter()
const plots = shallowRef<PublicPlot[]>([])
const loading = ref(true)
const district = ref('')

const districts = computed(() => [...new Set(plots.value.map((p) => p.location.district))])
const visible = computed(() => plots.value.filter((p) => !district.value || p.location.district === district.value))

const openPlot = (plot: MapPlot) => router.push({ name: ROUTE_NAMES.PUBLIC_PLOT, params: { id: plot.id } })

onMounted(async () => {
  try {
    plots.value = await publicService.plots()
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <PageHeader
      eyebrow="Puntos periurbanos"
      title="Predios donde cultivamos"
      description="Terrenos de los corregimientos de Cereté que las familias agricultoras prestan al proyecto. Cada uno tiene su caracterización, sus cultivos y evidencias fotográficas."
    />

    <PlotMap :plots="visible" height="380px" @select="openPlot" />

    <div v-if="districts.length > 1" class="chips" role="group" aria-label="Filtrar por corregimiento">
      <button type="button" class="chip" :class="{ 'chip--on': !district }" @click="district = ''">Todos</button>
      <button
        v-for="d in districts"
        :key="d"
        type="button"
        class="chip"
        :class="{ 'chip--on': district === d }"
        @click="district = d"
      >
        {{ d }}
      </button>
    </div>

    <EmptyState v-if="!loading && !visible.length" icon="map" title="Aún no hay predios publicados" />
    <div class="grid cards">
      <PublicPlotCard v-for="plot in visible" :key="plot.id" :plot="plot" />
    </div>
  </div>
</template>

<style scoped>
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin: var(--space-6) 0 0;
}
.chip {
  height: 36px;
  padding: 0 var(--space-4);
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-pill);
  background: var(--surface);
  font-size: var(--text-sm);
  cursor: pointer;
}
.chip--on {
  background: var(--leaf-700);
  border-color: var(--leaf-700);
  color: #fff;
}
.cards {
  margin-top: var(--space-6);
  grid-template-columns: repeat(auto-fill, minmax(min(300px, 100%), 1fr));
}
</style>
