<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { BaseButton, BaseInput, BaseModal, BaseSelect } from '@/components/ui'
import { useAsyncAction } from '@/composables/useAsyncAction'
import type { Device, Plot, SensorProvider } from '@/models'
import { sensorService } from '@/services'

const props = defineProps<{ plots: Plot[]; providers: SensorProvider[] }>()
const open = defineModel<boolean>('open', { required: true })
const emit = defineEmits<{ saved: [device: Device] }>()

const form = reactive({ name: '', provider: '', externalId: '', kind: '', metrics: '', plotId: '' })
const { pending, run } = useAsyncAction()

watch(open, (value) => {
  if (!value) return
  const fallback = props.providers.find((p) => p.isDefault)?.key ?? ''
  Object.assign(form, { name: '', provider: fallback, externalId: '', kind: '', metrics: '', plotId: '' })
})

const providerOptions = computed(() =>
  props.providers.map((p) => ({ value: p.key, label: p.configured ? p.displayName : `${p.displayName} (sin configurar)` })),
)
const plotOptions = computed(() => props.plots.map((p) => ({ value: p.id, label: p.name })))

async function submit() {
  const saved = await run(
    () =>
      sensorService.createDevice({
        name: form.name.trim(),
        provider: form.provider || undefined,
        externalId: form.externalId.trim(),
        kind: form.kind.trim() || undefined,
        metrics: form.metrics
          .split(',')
          .map((m) => m.trim())
          .filter(Boolean),
        plotId: form.plotId || undefined,
      }),
    'Dispositivo registrado',
  )
  if (saved) {
    emit('saved', saved)
    open.value = false
  }
}
</script>

<template>
  <BaseModal
    v-model:open="open"
    title="Registrar dispositivo"
    description="El proveedor define qué adapter traduce los datos del sensor."
  >
    <form id="device-form" class="stack" @submit.prevent="submit">
      <div class="grid grid--2">
        <BaseInput v-model="form.name" label="Nombre" required />
        <BaseSelect v-model="form.provider" label="Proveedor (adapter)" :options="providerOptions" required />
        <BaseInput v-model="form.externalId" label="ID en el proveedor" placeholder="mock-02" required />
        <BaseInput v-model="form.kind" label="Tipo" placeholder="soil-probe" />
      </div>
      <BaseInput
        v-model="form.metrics"
        label="Métricas"
        placeholder="soil_moisture, air_temperature"
        hint="Separadas por coma. Déjalo vacío si aún no se conocen."
      />
      <BaseSelect v-model="form.plotId" label="Predio" :options="plotOptions" placeholder="Sin asignar" />
    </form>
    <template #footer>
      <BaseButton variant="ghost" @click="open = false">Cancelar</BaseButton>
      <BaseButton type="submit" form="device-form" :loading="pending" icon="check">Registrar</BaseButton>
    </template>
  </BaseModal>
</template>
