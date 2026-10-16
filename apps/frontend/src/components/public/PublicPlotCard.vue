<script setup lang="ts">
import { computed } from 'vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import { CROP_STATUS, ROUTE_NAMES, WATER_ACCESS } from '@/constants'
import type { PublicPlot } from '@/models'
import { formatArea } from '@/utils/format'

const props = defineProps<{ plot: PublicPlot }>()

const activeCrops = computed(() =>
  props.plot.crops.filter((crop) => ['planted', 'growing', 'harvesting'].includes(crop.status)),
)
</script>

<template>
  <RouterLink :to="{ name: ROUTE_NAMES.PUBLIC_PLOT, params: { id: plot.id } }" class="plot-card">
    <div class="plot-card__cover">
      <img v-if="plot.coverUrl" :src="plot.coverUrl" :alt="`Foto del ${plot.name}`" loading="lazy" />
      <div v-else class="plot-card__placeholder" aria-hidden="true">
        <svg viewBox="0 0 200 120" preserveAspectRatio="none">
          <path d="M0 80 C50 60 90 95 140 72 S190 60 200 66 V120 H0 Z" fill="var(--leaf-300)" />
          <path d="M0 96 C60 80 110 110 160 92 S195 86 200 88 V120 H0 Z" fill="var(--leaf-600)" />
          <circle cx="160" cy="34" r="16" fill="var(--sun-500)" />
        </svg>
      </div>
      <span v-if="plot.photoCount" class="plot-card__count">
        <BaseIcon name="leaf" :size="13" /> {{ plot.photoCount }} {{ plot.photoCount === 1 ? 'foto' : 'fotos' }}
      </span>
    </div>
    <div class="plot-card__body">
      <span class="eyebrow">{{ plot.location.municipality }} · {{ plot.location.district }}</span>
      <h3>{{ plot.name }}</h3>
      <div class="plot-card__facts">
        <span v-if="plot.areaM2"><BaseIcon name="scale" :size="14" /> {{ formatArea(plot.areaM2) }}</span>
        <span v-if="plot.characterization.waterAccess">
          <BaseIcon name="droplet" :size="14" /> Agua {{ WATER_ACCESS[plot.characterization.waterAccess].toLowerCase() }}
        </span>
      </div>
      <div v-if="activeCrops.length" class="plot-card__crops">
        <BaseBadge v-for="crop in activeCrops" :key="crop.id" :tone="CROP_STATUS[crop.status].tone">
          {{ crop.species }}
        </BaseBadge>
      </div>
      <span v-else class="faint">Preparando la próxima siembra</span>
    </div>
  </RouterLink>
</template>

<style scoped>
.plot-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: var(--radius-leaf);
  background: var(--surface);
  color: inherit;
  text-decoration: none !important;
  transition:
    transform var(--transition),
    border-color var(--transition);
}
.plot-card:hover {
  transform: translateY(-3px);
  border-color: var(--leaf-300);
}
.plot-card__cover {
  position: relative;
  aspect-ratio: 16 / 10;
  background: var(--leaf-100);
}
.plot-card__cover img,
.plot-card__placeholder,
.plot-card__placeholder svg {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.plot-card__count {
  position: absolute;
  right: var(--space-3);
  bottom: var(--space-3);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px var(--space-3);
  border-radius: var(--radius-pill);
  background: var(--surface);
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--leaf-800);
}
.plot-card__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-5);
}
.plot-card__facts {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  font-size: var(--text-sm);
  color: var(--ink-2);
}
.plot-card__facts span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.plot-card__crops {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-1);
}
</style>
