<script setup lang="ts">
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { MAP_DEFAULTS } from '@/constants/app'
import type { Plot } from '@/models'
import { escapeHtml } from '@/utils/format'
import { toLatLng } from '@/utils/geo'

/**
 * Mapa de predios. Usa marcadores propios (divIcon) en lugar de los PNG por defecto
 * de Leaflet para mantener la estética plana y evitar problemas de assets con Vite.
 */
const props = withDefaults(
  defineProps<{
    plots?: Plot[]
    height?: string
    /** Modo selección: un clic coloca/mueve el marcador y emite las coordenadas. */
    pickable?: boolean
    picked?: { lat: number; lng: number } | null
    selectedId?: string
  }>(),
  { plots: () => [], height: '420px', picked: null },
)

const emit = defineEmits<{ pick: [coords: { lat: number; lng: number }]; select: [plot: Plot] }>()

const container = ref<HTMLDivElement>()
let map: L.Map | null = null
let plotLayer: L.LayerGroup | null = null
let pickMarker: L.Marker | null = null
let resizeObserver: ResizeObserver | null = null

const pinIcon = (active = false) =>
  L.divIcon({
    className: 'agro-pin-wrap',
    html: `<span class="agro-pin${active ? ' agro-pin--active' : ''}"><span></span></span>`,
    iconSize: [34, 40],
    iconAnchor: [17, 38],
    popupAnchor: [0, -34],
  })

function renderPlots() {
  if (!map || !plotLayer) return
  plotLayer.clearLayers()
  const bounds: L.LatLngExpression[] = []

  for (const plot of props.plots) {
    const latLng = toLatLng(plot.location.point)
    bounds.push(latLng)
    L.marker(latLng, { icon: pinIcon(plot.id === props.selectedId), title: plot.name })
      .bindPopup(`<strong>${escapeHtml(plot.name)}</strong><br/><small>${escapeHtml(plot.location.district)}</small>`)
      .on('click', () => emit('select', plot))
      .addTo(plotLayer)

    if (plot.boundary) {
      const ring = plot.boundary.coordinates[0]?.map(([lng, lat]) => [lat, lng] as [number, number]) ?? []
      L.polygon(ring, { color: '#066c20', weight: 2, fillColor: '#a9cfa6', fillOpacity: 0.35 }).addTo(plotLayer)
    }
  }

  if (!props.pickable && bounds.length) {
    map.fitBounds(L.latLngBounds(bounds), { padding: [48, 48], maxZoom: 15, animate: false })
  }
}

function renderPicked() {
  if (!map) return
  if (!props.picked) {
    pickMarker?.remove()
    pickMarker = null
    return
  }
  const latLng: L.LatLngTuple = [props.picked.lat, props.picked.lng]
  if (pickMarker) pickMarker.setLatLng(latLng)
  else pickMarker = L.marker(latLng, { icon: pinIcon(true) }).addTo(map)
}

onMounted(() => {
  if (!container.value) return
  map = L.map(container.value, { zoomControl: true, attributionControl: true }).setView(
    props.picked ? [props.picked.lat, props.picked.lng] : MAP_DEFAULTS.center,
    props.picked ? 15 : MAP_DEFAULTS.zoom,
  )
  L.tileLayer(MAP_DEFAULTS.tiles, { attribution: MAP_DEFAULTS.attribution, maxZoom: 19 }).addTo(map)
  plotLayer = L.layerGroup().addTo(map)

  if (props.pickable) {
    map.on('click', (event: L.LeafletMouseEvent) => {
      emit('pick', { lat: event.latlng.lat, lng: event.latlng.lng })
    })
  }

  renderPlots()
  renderPicked()
  // Recalcular tamaño si el contenedor cambia (modales, layouts en grid, menú móvil)
  resizeObserver = new ResizeObserver(() => map?.invalidateSize())
  resizeObserver.observe(container.value)
})

watch(() => [props.plots, props.selectedId], renderPlots, { deep: true })
watch(() => props.picked, renderPicked, { deep: true })

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  map?.remove()
  map = null
})
</script>

<template>
  <div ref="container" class="plot-map" :class="{ 'plot-map--pick': pickable }" :style="{ height }" />
</template>

<style scoped>
.plot-map {
  width: 100%;
  border-radius: var(--radius-lg);
  border: 1px solid var(--line);
  overflow: hidden;
  z-index: 0;
}
.plot-map--pick {
  cursor: crosshair;
}
.plot-map :deep(.agro-pin-wrap) {
  background: none;
  border: 0;
}
.plot-map :deep(.agro-pin) {
  position: relative;
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 50% 50% 50% 4px;
  transform: rotate(-45deg);
  background: var(--leaf-700);
  border: 3px solid #fff;
  box-shadow: 0 2px 6px rgba(30, 43, 33, 0.25);
}
.plot-map :deep(.agro-pin span) {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #fff;
}
.plot-map :deep(.agro-pin--active) {
  background: var(--sun-500);
}
</style>
