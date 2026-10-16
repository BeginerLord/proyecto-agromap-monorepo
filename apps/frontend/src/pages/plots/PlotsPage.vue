<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import PlotMap from '@/components/map/PlotMap.vue'
import PlotFormModal from '@/components/plots/PlotFormModal.vue'
import { BaseBadge, BaseButton, BaseCard, BaseIcon, BasePagination, EmptyState, PageHeader, SearchInput } from '@/components/ui'
import { usePaginatedList } from '@/composables/usePaginatedList'
import { DISTRICTS, ROLE_GROUPS, ROUTE_NAMES, WATER_ACCESS } from '@/constants'
import type { Plot, PlotQuery } from '@/models'
import { plotService } from '@/services'
import { useAuthStore } from '@/stores/auth.store'
import { formatArea } from '@/utils/format'

const router = useRouter()
const auth = useAuthStore()
const canManage = computed(() => auth.hasRole(ROLE_GROUPS.MANAGERS))

const { items, meta, loading, filters, page, load } = usePaginatedList<Plot, PlotQuery>(
  (query) => plotService.list(query),
  { search: '', district: '' },
)
const formOpen = ref(false)

const open = (plot: Plot) => router.push({ name: ROUTE_NAMES.PLOT_DETAIL, params: { id: plot.id } })

onMounted(load)
</script>

<template>
  <div>
    <PageHeader
      eyebrow="Territorio"
      title="Predios periurbanos"
      description="Predios georreferenciados y su caracterización agroecológica (Fase I: diagnóstico)."
    >
      <template #actions>
        <BaseButton v-if="canManage" icon="plus" @click="formOpen = true">Nuevo predio</BaseButton>
      </template>
    </PageHeader>

    <div class="plots">
      <BaseCard padding="none" class="plots__map">
        <PlotMap :plots="items" height="100%" @select="open" />
      </BaseCard>

      <div class="stack">
        <div class="row row--wrap">
          <SearchInput v-model="filters.search" placeholder="Buscar por nombre o propietario" />
          <div class="chips" role="group" aria-label="Filtrar por corregimiento">
            <button type="button" class="chip" :class="{ 'chip--on': !filters.district }" @click="filters.district = ''">
              Todos
            </button>
            <button
              v-for="district in DISTRICTS"
              :key="district"
              type="button"
              class="chip"
              :class="{ 'chip--on': filters.district === district }"
              @click="filters.district = district"
            >
              {{ district }}
            </button>
          </div>
        </div>

        <EmptyState
          v-if="!loading && !items.length"
          icon="map"
          title="No hay predios"
          description="Registra el primer predio ubicándolo en el mapa."
        />

        <BaseCard v-for="plot in items" :key="plot.id" interactive @click="open(plot)">
          <div class="plot">
            <span class="plot__mark"><BaseIcon name="pin" /></span>
            <div class="plot__body">
              <div class="row row--between">
                <h4>{{ plot.name }}</h4>
                <BaseBadge :tone="plot.status === 'active' ? 'leaf' : 'neutral'">
                  {{ plot.status === 'active' ? 'Activo' : 'Inactivo' }}
                </BaseBadge>
              </div>
              <p class="faint">{{ plot.location.district }} · {{ plot.owner.name }}</p>
              <div class="plot__facts">
                <span v-if="plot.areaM2"><BaseIcon name="scale" :size="14" /> {{ formatArea(plot.areaM2) }}</span>
                <span v-if="plot.characterization.soilType"><BaseIcon name="leaf" :size="14" /> {{ plot.characterization.soilType }}</span>
                <span v-if="plot.characterization.waterAccess">
                  <BaseIcon name="droplet" :size="14" /> Agua {{ WATER_ACCESS[plot.characterization.waterAccess].toLowerCase() }}
                </span>
              </div>
            </div>
          </div>
        </BaseCard>

        <BasePagination v-model="page" :meta="meta" />
      </div>
    </div>

    <PlotFormModal v-model:open="formOpen" @saved="load" />
  </div>
</template>

<style scoped>
.plots {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
  gap: var(--space-6);
  align-items: start;
}
.plots__map {
  position: sticky;
  top: calc(var(--topbar-height) + var(--space-6));
  height: 560px;
  overflow: hidden;
}
.plots__map :deep(.plot-map) {
  border: 0;
  border-radius: 0;
}
.chips {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
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
.plot {
  display: flex;
  gap: var(--space-4);
}
.plot__mark {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: var(--radius-leaf-sm);
  background: var(--leaf-100);
  color: var(--leaf-700);
}
.plot__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
.plot__facts {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  margin-top: var(--space-2);
  font-size: var(--text-sm);
  color: var(--ink-2);
}
.plot__facts span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
@media (max-width: 1080px) {
  .plots {
    grid-template-columns: 1fr;
  }
  .plots__map {
    position: static;
    height: 360px;
  }
}
</style>
