<script setup lang="ts">
import type { Tone } from '@/constants/labels'

withDefaults(defineProps<{ tone?: Tone; dot?: boolean }>(), { tone: 'neutral', dot: true })
</script>

<template>
  <span class="badge" :class="`badge--${tone}`">
    <span v-if="dot" class="badge__dot" aria-hidden="true" />
    <slot />
  </span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 26px;
  padding: 0 var(--space-3);
  border-radius: var(--radius-pill);
  font-size: var(--text-xs);
  font-weight: 600;
  white-space: nowrap;
}
.badge__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
}
.badge--leaf {
  background: var(--leaf-100);
  color: var(--leaf-800);
}
.badge--soil {
  background: var(--soil-100);
  color: var(--soil-700);
}
.badge--sun {
  background: var(--sun-100);
  color: var(--sun-700);
}
.badge--water {
  background: var(--water-100);
  color: var(--water-700);
}
.badge--clay {
  background: var(--clay-100);
  color: var(--clay-700);
}
.badge--neutral {
  background: var(--sand);
  color: var(--ink-2);
}
</style>
