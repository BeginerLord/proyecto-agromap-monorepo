<script setup lang="ts">
import { ref } from 'vue'
import PlotMap, { type MapPlot } from './PlotMap.vue'

/**
 * Mapa de un predio sin consumo de Mapbox: muestra la imagen estática que el backend guardó
 * al registrar el predio. Solo si aún no existe (predios antiguos) cae al mapa interactivo.
 */
const props = withDefaults(defineProps<{ plot: MapPlot; snapshotUrl?: string; height?: string }>(), { height: '300px' })
const failed = ref(false)
</script>

<template>
  <figure v-if="props.snapshotUrl && !failed" class="static-map" :style="{ height }">
    <img :src="props.snapshotUrl" :alt="`Mapa del ${plot.name}`" loading="lazy" @error="failed = true" />
    <figcaption>© Mapbox © OpenStreetMap</figcaption>
  </figure>
  <PlotMap v-else :plots="[plot]" :selected-id="plot.id" :height="height" />
</template>

<style scoped>
.static-map {
  position: relative;
  margin: 0;
  border-radius: var(--radius-lg);
  border: 1px solid var(--line);
  overflow: hidden;
  background: var(--sand);
}
.static-map img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.static-map figcaption {
  position: absolute;
  right: 0;
  bottom: 0;
  padding: 2px 8px;
  background: rgba(255, 253, 248, 0.85);
  font-size: 11px;
  color: var(--ink-2);
  border-top-left-radius: var(--radius-sm);
}
</style>
