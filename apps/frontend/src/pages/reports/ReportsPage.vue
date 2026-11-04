<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import CropStatusBreakdown from '@/components/dashboard/CropStatusBreakdown.vue'
import StatCard from '@/components/dashboard/StatCard.vue'
import BarChart from '@/components/reports/BarChart.vue'
import RankBars from '@/components/reports/RankBars.vue'
import { BaseButton, BaseCard, BaseInput, PageHeader } from '@/components/ui'
import { FIELD_LOG_TYPES } from '@/constants'
import type { CropStatus, FieldLogType, ReportSummary } from '@/models'
import { reportService } from '@/services'
import { useToastStore } from '@/stores/toast.store'
import { formatDate, formatKg, formatNumber, fromDateInput } from '@/utils/format'

type Preset = '3m' | '6m' | '12m' | 'year' | 'custom'

const toast = useToastStore()
const report = ref<ReportSummary | null>(null)
const loading = ref(false)
const preset = ref<Preset>('6m')
const custom = ref({ from: '', to: '' })

const presets: { key: Preset; label: string }[] = [
  { key: '3m', label: '3 meses' },
  { key: '6m', label: '6 meses' },
  { key: '12m', label: '12 meses' },
  { key: 'year', label: 'Este año' },
  { key: 'custom', label: 'Personalizado' },
]

function range(): { from?: string; to?: string } {
  const now = new Date()
  const monthsBack = (n: number) => new Date(now.getFullYear(), now.getMonth() - n + 1, 1).toISOString()
  switch (preset.value) {
    case '3m':
      return { from: monthsBack(3), to: now.toISOString() }
    case '6m':
      return { from: monthsBack(6), to: now.toISOString() }
    case '12m':
      return { from: monthsBack(12), to: now.toISOString() }
    case 'year':
      return { from: new Date(now.getFullYear(), 0, 1).toISOString(), to: now.toISOString() }
    case 'custom':
      return { from: fromDateInput(custom.value.from), to: fromDateInput(custom.value.to) }
  }
}

async function load() {
  if (preset.value === 'custom' && (!custom.value.from || !custom.value.to)) return
  loading.value = true
  try {
    report.value = await reportService.summary(range())
  } catch (error) {
    toast.error((error as Error).message)
  } finally {
    loading.value = false
  }
}

watch(preset, load)
watch(custom, load, { deep: true })
onMounted(load)

// ─── Datos derivados para las gráficas ─────────────────
const months = computed(() => (report.value ? reportService.monthsBetween(report.value.period.from, report.value.period.to) : []))
const monthLabels = computed(() => months.value.map(reportService.monthLabel))
const byMonth = <T extends { month: string }>(rows: T[], pick: (row: T) => number) =>
  months.value.map((m) => {
    const row = rows.find((r) => r.month === m)
    return row ? pick(row) : 0
  })

const productionSeries = computed(() =>
  report.value
    ? [
        { name: 'Cosechado', color: 'var(--leaf-600)', values: byMonth(report.value.harvestByMonth, (r) => r.kg) },
        { name: 'Entregado', color: 'var(--sun-500)', values: byMonth(report.value.distributionByMonth, (r) => r.kg) },
      ]
    : [],
)
const beneficiariesSeries = computed(() =>
  report.value
    ? [{ name: 'Estudiantes', color: 'var(--water-500)', values: byMonth(report.value.distributionByMonth, (r) => r.beneficiaries) }]
    : [],
)

const statusCounts = computed(
  () => Object.fromEntries((report.value?.cropsByStatus ?? []).map((r) => [r.key, r.count])) as Partial<Record<CropStatus, number>>,
)
const totalCrops = computed(() => (report.value?.cropsByStatus ?? []).reduce((sum, r) => sum + r.count, 0))
const logRows = computed(() =>
  (report.value?.fieldLogsByType ?? []).map((r) => ({
    label: FIELD_LOG_TYPES[r.key as FieldLogType]?.label ?? r.key,
    value: r.count,
  })),
)
const deliveryRate = computed(() => {
  const t = report.value?.totals
  return t && t.harvestedKg > 0 ? Math.round((t.distributedKg / t.harvestedKg) * 100) : 0
})

// ─── Exportación ───────────────────────────────────────
const stamp = () => new Date().toISOString().slice(0, 10)

function exportMonthly() {
  if (!report.value) return
  reportService.downloadCsv(
    `agromap-mensual-${stamp()}`,
    months.value.map((m, i) => ({
      Mes: m,
      'Cosechado (kg)': productionSeries.value[0]?.values[i] ?? 0,
      'Entregado (kg)': productionSeries.value[1]?.values[i] ?? 0,
      'Estudiantes beneficiados': beneficiariesSeries.value[0]?.values[i] ?? 0,
    })),
  )
}

function exportSpecies() {
  if (!report.value) return
  const species = new Set([...report.value.harvestBySpecies, ...report.value.distributedBySpecies].map((r) => r.species))
  reportService.downloadCsv(
    `agromap-especies-${stamp()}`,
    [...species].map((s) => ({
      Especie: s,
      'Cosechado (kg)': report.value!.harvestBySpecies.find((r) => r.species === s)?.kg ?? 0,
      'Entregado (kg)': report.value!.distributedBySpecies.find((r) => r.species === s)?.kg ?? 0,
    })),
  )
}

function exportPlots() {
  if (!report.value) return
  reportService.downloadCsv(
    `agromap-predios-${stamp()}`,
    report.value.plots.map((p) => ({
      Predio: p.plot,
      Corregimiento: p.district,
      Cultivos: p.crops,
      'Cultivos activos': p.activeCrops,
      'Cosechado en el periodo (kg)': p.harvestedKg,
    })),
  )
}

function exportAll() {
  exportMonthly()
  exportSpecies()
  exportPlots()
}

const printReport = () => window.print()
</script>

<template>
  <div class="reports">
    <PageHeader
      eyebrow="Análisis"
      title="Estadísticas y reportes"
      description="Producción de los predios, alimentos entregados en las jornadas de apoyo y actividad de campo en el periodo seleccionado."
    >
      <template #actions>
        <BaseButton variant="secondary" icon="download" :disabled="!report" @click="exportAll">Exportar CSV</BaseButton>
        <BaseButton variant="secondary" icon="notebook" :disabled="!report" @click="printReport">Imprimir / PDF</BaseButton>
      </template>
    </PageHeader>

    <!-- Filtro de periodo -->
    <div class="filters no-print">
      <div class="chips" role="group" aria-label="Periodo">
        <button
          v-for="p in presets"
          :key="p.key"
          type="button"
          class="chip"
          :class="{ 'chip--on': preset === p.key }"
          @click="preset = p.key"
        >
          {{ p.label }}
        </button>
      </div>
      <div v-if="preset === 'custom'" class="filters__custom">
        <BaseInput v-model="custom.from" label="Desde" type="date" />
        <BaseInput v-model="custom.to" label="Hasta" type="date" />
      </div>
    </div>

    <template v-if="report">
      <p class="faint period">
        Periodo: {{ formatDate(report.period.from) }} — {{ formatDate(report.period.to) }}
        <span v-if="loading"> · actualizando…</span>
      </p>

      <div class="grid grid--4">
        <StatCard label="Cosechado" :value="formatKg(report.totals.harvestedKg)" icon="basket" :hint="`${report.totals.harvests} cosechas`" />
        <StatCard
          label="Entregado"
          :value="formatKg(report.totals.distributedKg)"
          icon="scale"
          tone="sun"
          :hint="`${deliveryRate}% de lo cosechado`"
        />
        <StatCard
          label="Estudiantes beneficiados"
          :value="formatNumber(report.totals.beneficiaries)"
          icon="users"
          tone="water"
          :hint="`${report.totals.distributions} jornadas`"
        />
        <StatCard label="Actividades de campo" :value="report.totals.fieldLogs" icon="notebook" tone="soil" hint="registros de bitácora" />
      </div>

      <BaseCard>
        <template #header>
          <div>
            <h3>Producción y entregas por mes</h3>
            <p class="faint">Kilos cosechados en los predios frente a kilos entregados a estudiantes</p>
          </div>
          <BaseButton size="sm" variant="ghost" icon="download" class="no-print" @click="exportMonthly">CSV</BaseButton>
        </template>
        <BarChart :categories="monthLabels" :series="productionSeries" unit="kg" label="Kilos cosechados y entregados por mes" />
        <details class="data-table">
          <summary>Ver tabla de datos</summary>
          <table class="table">
            <thead>
              <tr><th>Mes</th><th>Cosechado</th><th>Entregado</th><th>Estudiantes</th></tr>
            </thead>
            <tbody>
              <tr v-for="(label, i) in monthLabels" :key="label">
                <td>{{ label }}</td>
                <td class="num">{{ formatKg(productionSeries[0]?.values[i]) }}</td>
                <td class="num">{{ formatKg(productionSeries[1]?.values[i]) }}</td>
                <td class="num">{{ beneficiariesSeries[0]?.values[i] ?? 0 }}</td>
              </tr>
            </tbody>
          </table>
        </details>
      </BaseCard>

      <div class="grid grid--2" style="align-items: start">
        <BaseCard>
          <template #header>
            <div>
              <h3>Estudiantes beneficiados por mes</h3>
              <p class="faint">Suma de estudiantes atendidos en las jornadas</p>
            </div>
          </template>
          <BarChart :categories="monthLabels" :series="beneficiariesSeries" unit="estudiantes" :height="200" label="Estudiantes beneficiados por mes" />
        </BaseCard>

        <BaseCard>
          <template #header><h3>Estado de los cultivos</h3></template>
          <CropStatusBreakdown v-if="totalCrops" :by-status="statusCounts" :total="totalCrops" />
          <p v-else class="faint">Aún no hay cultivos registrados.</p>
        </BaseCard>
      </div>

      <div class="grid grid--2" style="align-items: start">
        <BaseCard>
          <template #header>
            <h3>Cosecha por especie</h3>
            <BaseButton size="sm" variant="ghost" icon="download" class="no-print" @click="exportSpecies">CSV</BaseButton>
          </template>
          <RankBars :rows="report.harvestBySpecies.map((r) => ({ label: r.species, value: r.kg }))" unit="kg" />
        </BaseCard>
        <BaseCard>
          <template #header><h3>Entregado por especie</h3></template>
          <RankBars
            :rows="report.distributedBySpecies.map((r) => ({ label: r.species, value: r.kg }))"
            unit="kg"
            color="var(--sun-500)"
            empty-text="Sin entregas en el periodo"
          />
        </BaseCard>
      </div>

      <div class="grid grid--2" style="align-items: start">
        <BaseCard>
          <template #header><h3>Actividades de bitácora</h3></template>
          <RankBars :rows="logRows" color="var(--soil-500)" empty-text="Sin actividades en el periodo" />
        </BaseCard>

        <BaseCard padding="none">
          <div class="plots-head">
            <h3>Resumen por predio</h3>
            <BaseButton size="sm" variant="ghost" icon="download" class="no-print" @click="exportPlots">CSV</BaseButton>
          </div>
          <div style="overflow-x: auto">
            <table class="table">
              <thead>
                <tr><th>Predio</th><th>Cultivos</th><th>Activos</th><th>Cosechado</th></tr>
              </thead>
              <tbody>
                <tr v-for="p in report.plots" :key="p.plotId">
                  <td>
                    <strong>{{ p.plot }}</strong>
                    <div class="faint">{{ p.district }}</div>
                  </td>
                  <td class="num">{{ p.crops }}</td>
                  <td class="num">{{ p.activeCrops }}</td>
                  <td class="num">{{ formatKg(p.harvestedKg) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </BaseCard>
      </div>
    </template>
  </div>
</template>

<style scoped>
.reports {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}
.reports :deep(.page-header) {
  margin-bottom: 0;
}
.filters {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: var(--space-4);
}
.filters__custom {
  display: flex;
  gap: var(--space-3);
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}
.chip {
  height: 36px;
  padding: 0 var(--space-4);
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-pill);
  background: var(--surface);
  font-size: var(--text-sm);
  cursor: pointer;
}
.chip--on {
  background: var(--leaf-700);
  border-color: var(--leaf-700);
  color: #fff;
}
.period {
  margin-top: calc(var(--space-2) * -1);
}
.data-table {
  margin-top: var(--space-4);
  font-size: var(--text-sm);
}
.data-table summary {
  cursor: pointer;
  color: var(--leaf-700);
  font-weight: 600;
  margin-bottom: var(--space-3);
}
.plots-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-5) var(--space-5) var(--space-3);
}
.plots-head h3 {
  font-size: var(--text-lg);
}
</style>
