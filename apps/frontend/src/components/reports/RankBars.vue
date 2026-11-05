<script setup lang="ts">
import { computed } from 'vue'
import EmptyState from '@/components/ui/EmptyState.vue'

/** Ranking en barras horizontales (una sola serie): etiqueta, barra y valor visibles. */
const props = withDefaults(
  defineProps<{ rows: { label: string; value: number }[]; unit?: string; color?: string; emptyText?: string }>(),
  { unit: '', color: 'var(--leaf-600)', emptyText: 'Sin datos en el periodo' },
)

const max = computed(() => Math.max(1, ...props.rows.map((r) => r.value)))
const fmt = (value: number) => new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 }).format(value)
</script>

<template>
  <ul v-if="rows.length" class="rank">
    <li v-for="row in rows" :key="row.label" class="rank__row" :title="`${row.label}: ${fmt(row.value)} ${unit}`">
      <span class="rank__label">{{ row.label }}</span>
      <span class="rank__track">
        <span class="rank__bar" :style="{ width: `${(row.value / max) * 100}%`, background: color }" />
      </span>
      <span class="rank__value num">{{ fmt(row.value) }} {{ unit }}</span>
    </li>
  </ul>
  <EmptyState v-else icon="chart" :title="emptyText" />
</template>

<style scoped>
.rank {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.rank__row {
  display: grid;
  grid-template-columns: minmax(90px, 1fr) minmax(0, 2fr) auto;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--text-sm);
}
.rank__label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rank__track {
  height: 10px;
  border-radius: var(--radius-pill);
  background: var(--sand);
  overflow: hidden;
}
.rank__bar {
  display: block;
  height: 100%;
  min-width: 4px;
  border-radius: 0 4px 4px 0;
}
.rank__value {
  min-width: 64px;
  text-align: right;
  color: var(--ink-2);
}
</style>
