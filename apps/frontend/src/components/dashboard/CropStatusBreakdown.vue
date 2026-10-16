<script setup lang="ts">
import { computed } from 'vue'
import { CROP_STATUS } from '@/constants/labels'
import type { CropStatus } from '@/models'

/** Barra apilada plana con la distribución de cultivos por estado. */
const props = defineProps<{ byStatus: Partial<Record<CropStatus, number>>; total: number }>()

const segments = computed(() =>
  (Object.keys(CROP_STATUS) as CropStatus[])
    .map((status) => ({ status, count: props.byStatus[status] ?? 0, ...CROP_STATUS[status] }))
    .filter((segment) => segment.count > 0),
)
</script>

<template>
  <div class="breakdown">
    <div class="breakdown__bar" role="img" :aria-label="`${total} cultivos por estado`">
      <span
        v-for="segment in segments"
        :key="segment.status"
        class="breakdown__seg"
        :class="`seg--${segment.tone}`"
        :style="{ flexGrow: segment.count }"
        :title="`${segment.label}: ${segment.count}`"
      />
    </div>
    <ul class="breakdown__legend">
      <li v-for="segment in segments" :key="segment.status">
        <span class="breakdown__swatch" :class="`seg--${segment.tone}`" />
        <span>{{ segment.label }}</span>
        <strong class="num">{{ segment.count }}</strong>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.breakdown {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.breakdown__bar {
  display: flex;
  gap: 3px;
  height: 14px;
  border-radius: var(--radius-pill);
  overflow: hidden;
  background: var(--sand);
}
.breakdown__seg {
  flex-basis: 0;
  min-width: 6px;
}
.breakdown__legend {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
}
.breakdown__legend li {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.breakdown__legend strong {
  margin-left: auto;
}
.breakdown__swatch {
  width: 10px;
  height: 10px;
  border-radius: 3px;
}
.seg--leaf {
  background: var(--leaf-600);
}
.seg--sun {
  background: var(--sun-500);
}
.seg--soil {
  background: var(--soil-500);
}
.seg--water {
  background: var(--water-500);
}
.seg--clay {
  background: var(--clay-500);
}
.seg--neutral {
  background: var(--ink-3);
}
</style>
