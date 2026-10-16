<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { BaseButton, BaseInput, BaseModal, BaseSelect, BaseTextarea } from '@/components/ui'
import { HARVEST_QUALITY, toOptions } from '@/constants/labels'
import { useAsyncAction } from '@/composables/useAsyncAction'
import type { Crop, Harvest, HarvestQuality } from '@/models'
import { cropService, harvestService } from '@/services'
import { fromDateInput } from '@/utils/format'

const props = defineProps<{ crops: Crop[] }>()
const open = defineModel<boolean>('open', { required: true })
const emit = defineEmits<{ saved: [harvest: Harvest] }>()

const today = () => new Date().toISOString().slice(0, 10)
const form = reactive({
  cropId: '',
  harvestedAt: today(),
  quantityKg: '' as number | '',
  quality: 'medium' as HarvestQuality,
  notes: '',
})
const { pending, run } = useAsyncAction()

watch(open, (value) => {
  if (value) Object.assign(form, { cropId: '', harvestedAt: today(), quantityKg: '', quality: 'medium', notes: '' })
})

const cropOptions = computed(() =>
  props.crops
    .filter((crop) => crop.status !== 'lost')
    .map((crop) => ({ value: crop.id, label: `${cropService.label(crop)} — ${crop.plot.name}` })),
)

async function submit() {
  if (typeof form.quantityKg !== 'number') return
  const saved = await run(
    () =>
      harvestService.create({
        cropId: form.cropId,
        harvestedAt: fromDateInput(form.harvestedAt),
        quantityKg: form.quantityKg as number,
        quality: form.quality,
        notes: form.notes.trim() || undefined,
      }),
    'Cosecha registrada',
  )
  if (saved) {
    emit('saved', saved)
    open.value = false
  }
}
</script>

<template>
  <BaseModal v-model:open="open" title="Registrar cosecha" description="Los kilos quedarán disponibles para las jornadas sabatinas.">
    <form id="harvest-form" class="stack" @submit.prevent="submit">
      <BaseSelect v-model="form.cropId" label="Cultivo" :options="cropOptions" placeholder="Selecciona…" required />
      <div class="grid grid--2">
        <BaseInput v-model="form.harvestedAt" label="Fecha" type="date" required />
        <BaseInput v-model="form.quantityKg" label="Cantidad (kg)" type="number" min="0.1" step="0.1" required />
        <BaseSelect v-model="form.quality" label="Calidad" :options="toOptions(HARVEST_QUALITY)" />
      </div>
      <BaseTextarea v-model="form.notes" label="Notas" :rows="2" />
    </form>
    <template #footer>
      <BaseButton variant="ghost" @click="open = false">Cancelar</BaseButton>
      <BaseButton type="submit" form="harvest-form" :loading="pending" icon="check">Registrar</BaseButton>
    </template>
  </BaseModal>
</template>
