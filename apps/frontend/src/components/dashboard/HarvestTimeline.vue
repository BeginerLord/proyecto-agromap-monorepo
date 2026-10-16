<script setup lang="ts">
import BaseBadge from '@/components/ui/BaseBadge.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { CROP_STATUS } from '@/constants/labels'
import type { Crop } from '@/models'
import { cropService } from '@/services'
import { formatRelativeDays, formatShortDate } from '@/utils/format'

/** Línea de tiempo: qué alimentos estarán disponibles y cuándo (clave para planear las jornadas). */
defineProps<{ crops: Crop[] }>()
</script>

<template>
  <ol v-if="crops.length" class="timeline">
    <li v-for="crop in crops" :key="crop.id" class="timeline__item">
      <span class="timeline__date">
        <strong class="num">{{ formatShortDate(crop.expectedHarvestAt) }}</strong>
        <small>{{ formatRelativeDays(crop.expectedHarvestAt) }}</small>
      </span>
      <span class="timeline__dot" :class="`timeline__dot--${CROP_STATUS[crop.status].tone}`" aria-hidden="true" />
      <div class="timeline__body">
        <strong>{{ cropService.label(crop) }}</strong>
        <span class="faint">{{ crop.plot.name }}</span>
      </div>
      <BaseBadge :tone="CROP_STATUS[crop.status].tone">{{ CROP_STATUS[crop.status].label }}</BaseBadge>
    </li>
  </ol>
  <EmptyState
    v-else
    icon="calendar"
    title="Sin cosechas próximas"
    description="Registra la fecha de siembra y el ciclo de cada cultivo para estimar su cosecha."
  />
</template>

<style scoped>
.timeline {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}
.timeline__item {
  position: relative;
  display: grid;
  grid-template-columns: 84px 14px 1fr auto;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-3) 0;
}
.timeline__item:not(:last-child)::after {
  content: '';
  position: absolute;
  left: calc(84px + var(--space-4) + 6px);
  top: calc(50% + 10px);
  height: calc(100% - 20px);
  width: 2px;
  background: var(--line);
}
.timeline__date {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
  text-align: right;
}
.timeline__date small {
  font-size: var(--text-xs);
  color: var(--ink-3);
}
.timeline__dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 3px solid var(--surface);
  box-shadow: 0 0 0 1px var(--line-strong);
}
.timeline__dot--leaf {
  background: var(--leaf-600);
}
.timeline__dot--sun {
  background: var(--sun-500);
}
.timeline__dot--soil {
  background: var(--soil-500);
}
.timeline__dot--water {
  background: var(--water-500);
}
.timeline__dot--clay {
  background: var(--clay-500);
}
.timeline__dot--neutral {
  background: var(--ink-3);
}
.timeline__body {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
@media (max-width: 560px) {
  .timeline__item {
    grid-template-columns: 70px 14px 1fr;
  }
  .timeline__item :deep(.badge) {
    display: none;
  }
}
</style>
