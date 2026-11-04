<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue'
import DeviceFormModal from '@/components/sensors/DeviceFormModal.vue'
import SparkLine from '@/components/sensors/SparkLine.vue'
import { BaseBadge, BaseButton, BaseCard, BaseIcon, EmptyState, PageHeader } from '@/components/ui'
import { useAsyncAction } from '@/composables/useAsyncAction'
import { METRIC_LABELS, ROLE_GROUPS } from '@/constants'
import type { Device, MetricThreshold, Plot, SensorProvider } from '@/models'
import { plotService, sensorService, type MetricSnapshot } from '@/services'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'
import { formatDateTime, formatNumber } from '@/utils/format'

const auth = useAuthStore()
const toast = useToastStore()
const canManage = computed(() => auth.hasRole(ROLE_GROUPS.MANAGERS))

const enabled = ref(true)
const providers = shallowRef<SensorProvider[]>([])
const defaultThresholds = shallowRef<Record<string, MetricThreshold>>({})
const alertsEnabled = ref(true)
const devices = shallowRef<Device[]>([])
const plots = shallowRef<Plot[]>([])
const snapshots = ref<Record<string, MetricSnapshot[]>>({})
const formOpen = ref(false)
const { run, pending } = useAsyncAction()

async function load() {
  const [info, list] = await Promise.all([sensorService.providers(), sensorService.listDevices({ limit: 50 })])
  enabled.value = info.enabled
  providers.value = info.providers
  defaultThresholds.value = info.defaultThresholds
  alertsEnabled.value = info.alertsEnabled
  devices.value = list.data
  const entries = await Promise.all(devices.value.map(async (d) => [d.id, await sensorService.snapshot(d.id)] as const))
  snapshots.value = Object.fromEntries(entries)
}

async function sync(device: Device) {
  const result = await run(() => sensorService.sync(device.id))
  if (result) {
    if (result.alerts > 0) {
      toast.info(`${result.alerts} ${result.alerts === 1 ? 'alerta registrada' : 'alertas registradas'} en la bitácora`)
    } else {
      toast.success(`${result.stored} lecturas sincronizadas, todas dentro de rango`)
    }
    await load()
  }
}

/** Rango normal de una métrica para el dispositivo (propio o por defecto). */
function rangeOf(device: Device, metric: string): MetricThreshold | undefined {
  return device.thresholds?.[metric] ?? defaultThresholds.value[metric]
}

function isOutOfRange(device: Device, snap: MetricSnapshot): boolean {
  const range = rangeOf(device, snap.metric)
  const value = snap.latest.value
  return !!range && ((range.min !== undefined && value < range.min) || (range.max !== undefined && value > range.max))
}

function rangeLabel(device: Device, snap: MetricSnapshot): string {
  const range = rangeOf(device, snap.metric)
  if (!range) return 'Sin rango definido'
  const unit = snap.latest.unit ? ` ${snap.latest.unit}` : ''
  if (range.min !== undefined && range.max !== undefined) return `Rango ${formatNumber(range.min)}–${formatNumber(range.max)}${unit}`
  return range.min !== undefined ? `Mínimo ${formatNumber(range.min)}${unit}` : `Máximo ${formatNumber(range.max)}${unit}`
}

async function remove(device: Device) {
  if (!confirm(`¿Eliminar el dispositivo ${device.name}?`)) return
  await run(() => sensorService.removeDevice(device.id), 'Dispositivo eliminado')
  await load()
}

const providerName = (key: string) => providers.value.find((p) => p.key === key)?.displayName ?? key

onMounted(async () => {
  await run(load)
  if (canManage.value) plots.value = await plotService.all()
})
</script>

<template>
  <div>
    <PageHeader
      eyebrow="IoT · patrón adapter"
      title="Sensores de campo"
      description="Los dispositivos se conectan mediante adapters intercambiables. Mientras llega el hardware, el simulador genera lecturas de prueba."
    >
      <template #actions>
        <BaseButton v-if="canManage" icon="plus" :disabled="!enabled" @click="formOpen = true">Registrar dispositivo</BaseButton>
      </template>
    </PageHeader>

    <div class="providers">
      <span class="eyebrow">Adapters registrados</span>
      <div class="row row--wrap">
        <BaseBadge v-for="provider in providers" :key="provider.key" :tone="provider.configured ? 'leaf' : 'neutral'">
          {{ provider.displayName }}<template v-if="provider.isDefault"> · por defecto</template>
        </BaseBadge>
        <BaseBadge v-if="!enabled" tone="clay">Módulo deshabilitado</BaseBadge>
        <BaseBadge v-if="enabled" :tone="alertsEnabled ? 'water' : 'neutral'">
          {{ alertsEnabled ? 'Alertas a la bitácora activas' : 'Alertas a la bitácora desactivadas' }}
        </BaseBadge>
      </div>
    </div>

    <EmptyState
      v-if="!devices.length"
      icon="sensor"
      title="Sin dispositivos"
      description="Registra un dispositivo con el proveedor «Simulador» para ver lecturas de ejemplo."
    />

    <div class="grid grid--cards">
      <BaseCard v-for="device in devices" :key="device.id">
        <template #header>
          <div class="device__title">
            <span class="device__icon"><BaseIcon name="sensor" /></span>
            <div>
              <h3>{{ device.name }}</h3>
              <p class="faint">{{ providerName(device.provider) }} · {{ device.externalId }}<template v-if="device.plot"> · {{ device.plot.name }}</template></p>
            </div>
          </div>
          <BaseBadge :tone="device.status === 'active' ? 'leaf' : 'neutral'">
            {{ device.status === 'active' ? 'Activo' : device.status === 'inactive' ? 'Inactivo' : 'Sin datos' }}
          </BaseBadge>
        </template>

        <div v-if="snapshots[device.id]?.length" class="metrics">
          <div
            v-for="snap in snapshots[device.id]"
            :key="snap.metric"
            class="metric"
            :class="{ 'metric--alert': isOutOfRange(device, snap) }"
          >
            <span class="faint">{{ METRIC_LABELS[snap.metric] ?? snap.metric }}</span>
            <strong class="num">{{ formatNumber(snap.latest.value) }} <small>{{ snap.latest.unit }}</small></strong>
            <SparkLine :values="snap.series" :width="120" :height="28" />
            <small class="metric__range">{{ isOutOfRange(device, snap) ? 'Fuera de rango · ' : '' }}{{ rangeLabel(device, snap) }}</small>
          </div>
        </div>
        <p v-else class="faint">Aún no hay lecturas. Sincroniza o envía datos a la ingesta.</p>

        <div class="device__foot">
          <span class="faint">Última lectura: {{ formatDateTime(device.lastSeenAt) }}</span>
          <div v-if="canManage" class="row">
            <BaseButton size="sm" variant="secondary" icon="refresh" :loading="pending" @click="sync(device)">Sincronizar</BaseButton>
            <BaseButton size="sm" variant="ghost" icon="trash" aria-label="Eliminar" @click="remove(device)" />
          </div>
        </div>
      </BaseCard>
    </div>

    <DeviceFormModal v-model:open="formOpen" :plots="plots" :providers="providers" @saved="load" />
  </div>
</template>

<style scoped>
.providers {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-6);
}
.device__title {
  display: flex;
  gap: var(--space-3);
  align-items: center;
}
.device__icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: var(--radius-leaf-sm);
  background: var(--water-100);
  color: var(--water-700);
}
.metrics {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: var(--space-3);
}
.metric {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--space-3);
  border-radius: var(--radius-md);
  background: var(--paper);
}
.metric--alert {
  background: var(--clay-100);
}
.metric--alert strong {
  color: var(--clay-700);
}
.metric__range {
  font-size: var(--text-xs);
  color: var(--ink-3);
}
.metric--alert .metric__range {
  color: var(--clay-700);
  font-weight: 600;
}
.metric strong {
  font-size: var(--text-lg);
}
.metric small {
  font-size: var(--text-xs);
  color: var(--ink-3);
  font-weight: 500;
}
.device__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  flex-wrap: wrap;
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px dashed var(--line);
}
</style>
