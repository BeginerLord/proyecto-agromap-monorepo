<script setup lang="ts">
import { computed } from 'vue'

/** Mini gráfica de línea en SVG plano (sin librerías). */
const props = withDefaults(defineProps<{ values: number[]; width?: number; height?: number }>(), {
  width: 140,
  height: 36,
})

const points = computed(() => {
  if (props.values.length < 2) return ''
  const min = Math.min(...props.values)
  const max = Math.max(...props.values)
  const range = max - min || 1
  const step = props.width / (props.values.length - 1)
  return props.values
    .map((value, index) => `${(index * step).toFixed(1)},${(props.height - 4 - ((value - min) / range) * (props.height - 8)).toFixed(1)}`)
    .join(' ')
})
</script>

<template>
  <svg :width="width" :height="height" :viewBox="`0 0 ${width} ${height}`" class="spark" aria-hidden="true">
    <polyline v-if="points" :points="points" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
  </svg>
</template>

<style scoped>
.spark {
  color: var(--leaf-600);
  overflow: visible;
}
</style>
