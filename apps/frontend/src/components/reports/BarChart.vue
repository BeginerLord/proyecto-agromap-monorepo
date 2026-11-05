<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import EmptyState from '@/components/ui/EmptyState.vue'

/**
 * Barras verticales por categoría (una o varias series en la MISMA unidad; nunca doble eje).
 * Marcas finas con punta redondeada, separación de 2px, rejilla recesiva y tooltip al pasar el mouse.
 */
export interface BarSeries {
  name: string
  /** Variable CSS del color (p. ej. var(--leaf-600)). */
  color: string
  values: number[]
}

const props = withDefaults(
  defineProps<{ categories: string[]; series: BarSeries[]; unit?: string; height?: number; label: string }>(),
  { unit: '', height: 240 },
)

// El ancho del viewBox sigue al contenedor para que el texto conserve su tamaño real
const canvas = ref<HTMLDivElement>()
const width = ref(640)
let observer: ResizeObserver | null = null
onMounted(() => {
  if (!canvas.value) return
  observer = new ResizeObserver(([entry]) => {
    if (entry) width.value = Math.max(280, Math.round(entry.contentRect.width))
  })
  observer.observe(canvas.value)
})
onBeforeUnmount(() => observer?.disconnect())

const PAD = { top: 12, right: 8, bottom: 28, left: 44 }
const W = computed(() => width.value)
const plotW = computed(() => W.value - PAD.left - PAD.right)
const hasData = computed(() => props.series.some((s) => s.values.some((v) => v > 0)))
const plotH = computed(() => props.height - PAD.top - PAD.bottom)

const max = computed(() => {
  const highest = Math.max(0, ...props.series.flatMap((s) => s.values))
  if (highest === 0) return 1
  const magnitude = 10 ** Math.floor(Math.log10(highest))
  return Math.ceil(highest / magnitude) * magnitude
})
const ticks = computed(() => [0, 0.25, 0.5, 0.75, 1].map((f) => f * max.value))

const band = computed(() => plotW.value / Math.max(props.categories.length, 1))
const groupW = computed(() => Math.min(band.value * 0.64, 56 * props.series.length))
const barW = computed(() => (groupW.value - 2 * (props.series.length - 1)) / props.series.length)

const y = (value: number) => PAD.top + plotH.value - (value / max.value) * plotH.value
const fmt = (value: number) => new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 }).format(value)

/** Barra con esquinas superiores redondeadas (4px) anclada a la línea base. */
function barPath(x: number, value: number): string {
  const top = y(value)
  const bottom = PAD.top + plotH.value
  const h = bottom - top
  if (h <= 0) return ''
  const r = Math.min(4, barW.value / 2, h)
  return `M${x},${bottom} V${top + r} Q${x},${top} ${x + r},${top} H${x + barW.value - r} Q${x + barW.value},${top} ${x + barW.value},${top + r} V${bottom} Z`
}

const hover = ref<number | null>(null)
const tooltipLeft = computed(() =>
  hover.value === null ? 0 : ((PAD.left + band.value * (hover.value + 0.5)) / W.value) * 100,
)
</script>

<template>
  <figure class="chart">
    <figcaption class="sr-only">{{ label }}</figcaption>
    <ul v-if="series.length > 1 && hasData" class="chart__legend">
      <li v-for="s in series" :key="s.name"><span :style="{ background: s.color }" />{{ s.name }}</li>
    </ul>

    <EmptyState v-if="!hasData" icon="chart" title="Sin datos en el periodo" />
    <div v-show="hasData" ref="canvas" class="chart__canvas" @mouseleave="hover = null">
      <svg :viewBox="`0 0 ${W} ${height}`" role="img" :aria-label="label">
        <!-- rejilla y eje Y -->
        <g class="chart__grid">
          <g v-for="t in ticks" :key="t">
            <line :x1="PAD.left" :x2="W - PAD.right" :y1="y(t)" :y2="y(t)" />
            <text :x="PAD.left - 8" :y="y(t) + 4" text-anchor="end">{{ fmt(t) }}</text>
          </g>
        </g>

        <!-- barras -->
        <g v-for="(category, ci) in categories" :key="category">
          <rect
            class="chart__hit"
            :x="PAD.left + band * ci"
            :y="PAD.top"
            :width="band"
            :height="plotH"
            @mouseenter="hover = ci"
          />
          <path
            v-for="(s, si) in series"
            :key="s.name"
            :d="barPath(PAD.left + band * ci + (band - groupW) / 2 + si * (barW + 2), s.values[ci] ?? 0)"
            :fill="s.color"
            :opacity="hover === null || hover === ci ? 1 : 0.45"
            class="chart__bar"
          />
          <text
            v-if="band >= 44 || ci % Math.ceil(44 / band) === 0"
            class="chart__x"
            :x="PAD.left + band * (ci + 0.5)"
            :y="height - 8"
            text-anchor="middle"
          >
            {{ category }}
          </text>
        </g>
      </svg>

      <div v-if="hover !== null" class="chart__tooltip" :style="{ left: `${tooltipLeft}%` }">
        <strong>{{ categories[hover] }}</strong>
        <span v-for="s in series" :key="s.name">
          <i :style="{ background: s.color }" /> {{ s.name }}: <b class="num">{{ fmt(s.values[hover] ?? 0) }} {{ unit }}</b>
        </span>
      </div>
    </div>
  </figure>
</template>

<style scoped>
.chart {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.chart__legend {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  gap: var(--space-5);
  font-size: var(--text-sm);
  color: var(--ink-2);
}
.chart__legend li {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}
.chart__legend span {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}
.chart__canvas {
  position: relative;
}
.chart__canvas svg {
  width: 100%;
  height: auto;
  display: block;
  overflow: visible;
}
.chart__grid line {
  stroke: var(--line);
  stroke-width: 1;
}
.chart__grid text,
.chart__x {
  fill: var(--ink-3);
  font-size: 11px;
  font-family: var(--font-body);
}
.chart__hit {
  fill: transparent;
}
.chart__bar {
  transition: opacity var(--transition);
  pointer-events: none;
}
.chart__tooltip {
  position: absolute;
  top: 0;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 160px;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  background: var(--ink);
  color: #fff;
  font-size: var(--text-xs);
  pointer-events: none;
  white-space: nowrap;
  z-index: 2;
}
.chart__tooltip span {
  display: flex;
  align-items: center;
  gap: 6px;
}
.chart__tooltip i {
  width: 8px;
  height: 8px;
  border-radius: 2px;
}
</style>
