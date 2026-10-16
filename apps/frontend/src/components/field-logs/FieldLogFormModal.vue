<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { BaseButton, BaseInput, BaseModal, BaseSelect, BaseTextarea } from '@/components/ui'
import { FIELD_LOG_TYPES, toOptions } from '@/constants/labels'
import { useAsyncAction } from '@/composables/useAsyncAction'
import type { Crop, FieldLog, FieldLogType } from '@/models'
import { cropService, fieldLogService } from '@/services'
import { fromDateInput } from '@/utils/format'

const props = defineProps<{ crops: Crop[]; defaultCropId?: string }>()
const open = defineModel<boolean>('open', { required: true })
const emit = defineEmits<{ saved: [log: FieldLog] }>()

const today = () => new Date().toISOString().slice(0, 10)
const form = reactive({ cropId: '', type: 'observation' as FieldLogType, date: today(), description: '' })
const { pending, fieldErrors, run } = useAsyncAction()

watch(open, (value) => {
  if (value) Object.assign(form, { cropId: props.defaultCropId ?? '', type: 'observation', date: today(), description: '' })
})

const cropOptions = computed(() =>
  props.crops.map((crop) => ({ value: crop.id, label: `${cropService.label(crop)} — ${crop.plot.name}` })),
)

async function submit() {
  const saved = await run(
    () =>
      fieldLogService.create({
        cropId: form.cropId,
        type: form.type,
        date: fromDateInput(form.date),
        description: form.description,
      }),
    'Registro agregado a la bitácora',
  )
  if (saved) {
    emit('saved', saved)
    open.value = false
  }
}
</script>

<template>
  <BaseModal v-model:open="open" title="Nuevo registro de bitácora" :width="560">
    <form id="log-form" class="stack" @submit.prevent="submit">
      <BaseSelect v-model="form.cropId" label="Cultivo" :options="cropOptions" placeholder="Selecciona…" required />
      <div class="grid grid--2">
        <BaseSelect v-model="form.type" label="Actividad" :options="toOptions(FIELD_LOG_TYPES)" />
        <BaseInput v-model="form.date" label="Fecha" type="date" required />
      </div>
      <BaseTextarea
        v-model="form.description"
        label="Descripción"
        placeholder="¿Qué se hizo u observó en campo?"
        required
        :error="fieldErrors.description"
      />
    </form>
    <template #footer>
      <BaseButton variant="ghost" @click="open = false">Cancelar</BaseButton>
      <BaseButton type="submit" form="log-form" :loading="pending" icon="check">Guardar</BaseButton>
    </template>
  </BaseModal>
</template>
