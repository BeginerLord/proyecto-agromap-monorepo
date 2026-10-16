<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { BaseButton, BaseInput, BaseModal, BaseSelect, BaseTextarea } from '@/components/ui'
import { CROP_STATUS, toOptions } from '@/constants/labels'
import { useAsyncAction } from '@/composables/useAsyncAction'
import type { Crop, CropStatus, Plot } from '@/models'
import { cropService } from '@/services'
import { formatDate, fromDateInput, toDateInput } from '@/utils/format'

const props = defineProps<{ crop?: Crop | null; plots: Plot[]; defaultPlotId?: string }>()
const open = defineModel<boolean>('open', { required: true })
const emit = defineEmits<{ saved: [crop: Crop] }>()

const form = reactive({
  plotId: '',
  species: '',
  variety: '',
  status: 'planned' as CropStatus,
  plantedAt: '',
  cycleDays: '' as number | '',
  plantCount: '' as number | '',
  areaM2: '' as number | '',
  notes: '',
})
const { pending, fieldErrors, run } = useAsyncAction()

watch(open, (value) => {
  if (!value) return
  const crop = props.crop
  Object.assign(form, {
    plotId: crop?.plot.id ?? props.defaultPlotId ?? '',
    species: crop?.species ?? '',
    variety: crop?.variety ?? '',
    status: crop?.status ?? 'planned',
    plantedAt: toDateInput(crop?.plantedAt),
    cycleDays: crop?.cycleDays ?? '',
    plantCount: crop?.plantCount ?? '',
    areaM2: crop?.areaM2 ?? '',
    notes: crop?.notes ?? '',
  })
})

const estimated = computed(() => {
  if (!form.plantedAt || typeof form.cycleDays !== 'number') return null
  const date = new Date(`${form.plantedAt}T12:00:00`)
  date.setDate(date.getDate() + form.cycleDays)
  return date
})

const num = (value: number | '') => (typeof value === 'number' ? value : undefined)

async function submit() {
  const payload = {
    species: form.species.trim(),
    variety: form.variety.trim() || undefined,
    status: form.status,
    plantedAt: fromDateInput(form.plantedAt),
    cycleDays: num(form.cycleDays),
    plantCount: num(form.plantCount),
    areaM2: num(form.areaM2),
    notes: form.notes.trim() || undefined,
  }
  const saved = await run(
    () => (props.crop ? cropService.update(props.crop.id, payload) : cropService.create({ ...payload, plotId: form.plotId })),
    props.crop ? 'Cultivo actualizado' : 'Cultivo registrado',
  )
  if (saved) {
    emit('saved', saved)
    open.value = false
  }
}

const plotOptions = computed(() => props.plots.map((plot) => ({ value: plot.id, label: plot.name })))
</script>

<template>
  <BaseModal v-model:open="open" :title="crop ? 'Editar cultivo' : 'Nuevo cultivo'" :width="640">
    <form id="crop-form" class="stack" @submit.prevent="submit">
      <BaseSelect
        v-if="!crop"
        v-model="form.plotId"
        label="Predio"
        :options="plotOptions"
        placeholder="Selecciona un predio…"
        required
      />
      <div class="grid grid--2">
        <BaseInput v-model="form.species" label="Especie" placeholder="Ají, pepino, habichuela…" required :error="fieldErrors.species" />
        <BaseInput v-model="form.variety" label="Variedad" />
        <BaseSelect v-model="form.status" label="Estado" :options="toOptions(CROP_STATUS)" />
        <BaseInput v-model="form.plantedAt" label="Fecha de siembra" type="date" />
        <BaseInput
          v-model="form.cycleDays"
          label="Ciclo (días)"
          type="number"
          min="1"
          :hint="estimated ? `Cosecha estimada: ${formatDate(estimated)}` : 'Siembra → cosecha'"
        />
        <BaseInput v-model="form.plantCount" label="N.º de plantas" type="number" min="0" />
        <BaseInput v-model="form.areaM2" label="Área sembrada (m²)" type="number" min="0" />
      </div>
      <BaseTextarea v-model="form.notes" label="Notas" :rows="3" />
    </form>
    <template #footer>
      <BaseButton variant="ghost" @click="open = false">Cancelar</BaseButton>
      <BaseButton type="submit" form="crop-form" :loading="pending" icon="check">Guardar</BaseButton>
    </template>
  </BaseModal>
</template>
