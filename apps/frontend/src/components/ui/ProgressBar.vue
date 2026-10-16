<script setup lang="ts">
import type { Tone } from '@/constants/labels'

withDefaults(defineProps<{ value: number; tone?: Tone; label?: string }>(), { tone: 'leaf' })
</script>

<template>
  <div
    class="progress"
    role="progressbar"
    :aria-valuenow="value"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-label="label"
  >
    <span class="progress__fill" :class="`progress__fill--${tone}`" :style="{ width: `${value}%` }" />
  </div>
</template>

<style scoped>
.progress {
  height: 8px;
  border-radius: var(--radius-pill);
  background: var(--sand);
  overflow: hidden;
}
.progress__fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  transition: width 400ms ease;
}
.progress__fill--leaf {
  background: var(--leaf-600);
}
.progress__fill--sun {
  background: var(--sun-500);
}
.progress__fill--soil {
  background: var(--soil-500);
}
.progress__fill--water {
  background: var(--water-500);
}
.progress__fill--clay {
  background: var(--clay-500);
}
.progress__fill--neutral {
  background: var(--ink-3);
}
</style>
