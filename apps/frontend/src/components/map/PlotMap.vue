<script setup lang="ts">
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { MAP_DEFAULTS } from '@/constants/app'
import type { GeoPoint, GeoPolygon } from '@/models'
import { mapService } from '@/services/map.service'
import { escapeHtml } from '@/utils/format'

/**
 * Mapa interactivo con Mapbox GL JS (se factura por carga de mapa, no por tesela).
 * Los marcadores son elementos HTML propios para mantener la estética plana del proyecto.
 */
/** Lo mínimo que el mapa necesita de un predio (sirve para el panel y el sitio público). */
export interface MapPlot {
  id: string
  name: string
  location: { district: string; point: GeoPoint }
  boundary?: GeoPolygon
}

const props = withDefaults(
  defineProps<{
    plots?: MapPlot[]
    height?: string
    /** Modo selección: un clic coloca/mueve el marcador y emite las coordenadas. */
    pickable?: boolean
    picked?: { lat: number; lng: number } | null
    selectedId?: string
  }>(),
  { plots: () => [], height: '420px', picked: null },
)

const emit = defineEmits<{ pick: [coords: { lat: number; lng: number }]; select: [plot: MapPlot] }>()

const container = ref<HTMLDivElement>()
const unavailable = ref(false)
let map: mapboxgl.Map | null = null
let markers: mapboxgl.Marker[] = []
let pickMarker: mapboxgl.Marker | null = null
let resizeObserver: ResizeObserver | null = null
let styleReady = false

const BOUNDARIES = 'agromap-boundaries'

function pinElement(active = false): HTMLElement {
  const el = document.createElement('span')
  el.className = `agro-pin${active ? ' agro-pin--active' : ''}`
  el.innerHTML = '<span></span>'
  return el
}

function renderPlots() {
  if (!map) return
  markers.forEach((marker) => marker.remove())
  markers = []
  const bounds = new mapboxgl.LngLatBounds()

  for (const plot of props.plots) {
    const [lng, lat] = plot.location.point.coordinates
    bounds.extend([lng, lat])
    const el = pinElement(plot.id === props.selectedId)
    el.title = plot.name
    el.addEventListener('click', (event) => {
      event.stopPropagation()
      emit('select', plot)
    })
    const popup = new mapboxgl.Popup({ offset: 30, closeButton: false }).setHTML(
      `<strong>${escapeHtml(plot.name)}</strong><br/><small>${escapeHtml(plot.location.district)}</small>`,
    )
    markers.push(new mapboxgl.Marker({ element: el, anchor: 'bottom' }).setLngLat([lng, lat]).setPopup(popup).addTo(map))
  }

  renderBoundaries()
  if (!props.pickable && !bounds.isEmpty()) {
    map.fitBounds(bounds, { padding: 56, maxZoom: 15, animate: false })
  }
}

/** Linderos de los predios (GeoJSON Polygon) como capa de relleno + borde. */
function renderBoundaries() {
  if (!map || !styleReady) return
  const data: Parameters<mapboxgl.GeoJSONSource['setData']>[0] = {
    type: 'FeatureCollection',
    features: props.plots
      .filter((plot) => plot.boundary)
      .map((plot) => ({ type: 'Feature', properties: { id: plot.id }, geometry: plot.boundary! })),
  }
  const source = map.getSource(BOUNDARIES) as mapboxgl.GeoJSONSource | undefined
  if (source) {
    source.setData(data)
    return
  }
  map.addSource(BOUNDARIES, { type: 'geojson', data })
  map.addLayer({ id: `${BOUNDARIES}-fill`, type: 'fill', source: BOUNDARIES, paint: { 'fill-color': '#a9cfa6', 'fill-opacity': 0.35 } })
  map.addLayer({ id: `${BOUNDARIES}-line`, type: 'line', source: BOUNDARIES, paint: { 'line-color': '#066c20', 'line-width': 2 } })
}

function renderPicked() {
  if (!map) return
  if (!props.picked) {
    pickMarker?.remove()
    pickMarker = null
    return
  }
  const lngLat: [number, number] = [props.picked.lng, props.picked.lat]
  if (pickMarker) pickMarker.setLngLat(lngLat)
  else pickMarker = new mapboxgl.Marker({ element: pinElement(true), anchor: 'bottom' }).setLngLat(lngLat).addTo(map)
  // Si el punto llega de fuera de la vista (p. ej. la ubicación del dispositivo), centrar el mapa en él
  if (!map.getBounds()?.contains(lngLat)) map.jumpTo({ center: lngLat, zoom: Math.max(map.getZoom(), 16) })
}

onMounted(async () => {
  const config = await mapService.config()
  if (!container.value) return
  if (!config.enabled || !config.accessToken) {
    unavailable.value = true
    return
  }

  map = new mapboxgl.Map({
    container: container.value,
    accessToken: config.accessToken,
    style: config.style,
    center: props.picked ? [props.picked.lng, props.picked.lat] : [MAP_DEFAULTS.center[1], MAP_DEFAULTS.center[0]],
    zoom: props.picked ? 15 : MAP_DEFAULTS.zoom,
    cooperativeGestures: !props.pickable, // evita "secuestrar" el scroll de la página
  })
  map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-left')

  map.on('load', () => {
    styleReady = true
    renderBoundaries()
  })
  if (props.pickable) {
    map.on('click', (event) => emit('pick', { lat: event.lngLat.lat, lng: event.lngLat.lng }))
  }

  renderPlots()
  renderPicked()
  // Recalcular tamaño si el contenedor cambia (modales, layouts en grid, menú móvil)
  resizeObserver = new ResizeObserver(() => map?.resize())
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
  <div class="plot-map" :class="{ 'plot-map--pick': pickable }" :style="{ height }">
    <div v-show="!unavailable" ref="container" class="plot-map__canvas" />
    <div v-if="unavailable" class="plot-map__off" role="note">
      <strong>Mapa no disponible</strong>
      <span>Configura <code>MAPBOX_ACCESS_TOKEN</code> en <code>apps/backend/.env</code> para ver el mapa de Mapbox.</span>
    </div>
  </div>
</template>

<style scoped>
.plot-map {
  position: relative;
  width: 100%;
  border-radius: var(--radius-lg);
  border: 1px solid var(--line);
  overflow: hidden;
  z-index: 0;
  background: var(--sand);
}
.plot-map__canvas {
  position: absolute;
  inset: 0;
}
.plot-map--pick :deep(.mapboxgl-canvas-container) {
  cursor: crosshair;
}
.plot-map__off {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-6);
  text-align: center;
  font-size: var(--text-sm);
  color: var(--ink-2);
}
.plot-map :deep(.agro-pin) {
  position: relative;
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  margin-bottom: 6px;
  border-radius: 50% 50% 50% 4px;
  transform: rotate(-45deg);
  background: var(--leaf-700);
  border: 3px solid #fff;
  box-shadow: 0 2px 6px rgba(30, 43, 33, 0.25);
  cursor: pointer;
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
