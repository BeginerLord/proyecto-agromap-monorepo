<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import PlotMap from '@/components/map/PlotMap.vue'
import { BaseButton, BaseInput, BaseModal, BaseSelect, BaseTextarea } from '@/components/ui'
import { DISTRICTS, SUN_EXPOSURE, WATER_ACCESS, toOptions } from '@/constants/labels'
import { useAsyncAction } from '@/composables/useAsyncAction'
import type { Plot } from '@/models'
import { emptyPlotForm, plotService, type PlotForm } from '@/services'

const props = defineProps<{ plot?: Plot | null }>()
const open = defineModel<boolean>('open', { required: true })
const emit = defineEmits<{ saved: [plot: Plot] }>()

const form = ref<PlotForm>(emptyPlotForm())
const { pending, fieldErrors, run } = useAsyncAction()

watch(open, (value) => {
  if (value) form.value = props.plot ? plotService.toForm(props.plot) : emptyPlotForm()
})

const picked = computed(() =>
  typeof form.value.lat === 'number' && typeof form.value.lng === 'number' ? { lat: form.value.lat, lng: form.value.lng } : null,
)

function onPick({ lat, lng }: { lat: number; lng: number }) {
  form.value.lat = Number(lat.toFixed(6))
  form.value.lng = Number(lng.toFixed(6))
}

async function submit() {
  const saved = await run(
    () => plotService.save(form.value, props.plot?.id),
    props.plot ? 'Predio actualizado' : 'Predio registrado',
  )
  if (saved) {
    emit('saved', saved)
    open.value = false
  }
}

const districtOptions = DISTRICTS.map((d) => ({ value: d, label: d }))
</script>

<template>
  <BaseModal
    v-model:open="open"
    :title="plot ? 'Editar predio' : 'Nuevo predio'"
    description="Georreferencia el predio y registra su caracterización agroecológica."
    :width="760"
  >
    <form id="plot-form" class="form" @submit.prevent="submit">
      <fieldset class="form__group">
        <legend class="eyebrow">Identificación</legend>
        <div class="grid grid--2">
          <BaseInput v-model="form.name" label="Nombre del predio" required :error="fieldErrors.name" />
          <BaseSelect
            v-model="form.district"
            label="Corregimiento"
            :options="districtOptions"
            placeholder="Selecciona…"
            required
          />
          <BaseInput v-model="form.ownerName" label="Propietario" required :error="fieldErrors['owner.name']" />
          <BaseInput v-model="form.ownerPhone" label="Teléfono" type="tel" />
          <BaseInput v-model="form.address" label="Referencia / dirección" />
          <BaseInput v-model="form.areaM2" label="Área (m²)" type="number" min="0" />
        </div>
      </fieldset>

      <fieldset class="form__group">
        <legend class="eyebrow">Ubicación · haz clic en el mapa</legend>
        <PlotMap pickable :picked="picked" height="260px" @pick="onPick" />
        <div class="grid grid--2">
          <BaseInput v-model="form.lat" label="Latitud" type="number" step="0.000001" required />
          <BaseInput v-model="form.lng" label="Longitud" type="number" step="0.000001" required />
        </div>
      </fieldset>

      <fieldset class="form__group">
        <legend class="eyebrow">Caracterización</legend>
        <div class="grid grid--2">
          <BaseInput v-model="form.soilType" label="Tipo de suelo" placeholder="Franco arcilloso…" />
          <BaseSelect v-model="form.waterAccess" label="Acceso a agua" :options="toOptions(WATER_ACCESS)" placeholder="—" />
          <BaseSelect v-model="form.sunExposure" label="Exposición solar" :options="toOptions(SUN_EXPOSURE)" placeholder="—" />
          <BaseInput v-model="form.landUseHistory" label="Historial de uso" />
        </div>
        <BaseTextarea v-model="form.notes" label="Observaciones" :rows="3" />
      </fieldset>
    </form>

    <template #footer>
      <BaseButton variant="ghost" @click="open = false">Cancelar</BaseButton>
      <BaseButton type="submit" form="plot-form" :loading="pending" icon="check">Guardar predio</BaseButton>
    </template>
  </BaseModal>
</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}
.form__group {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin: 0;
  padding: 0;
  border: 0;
}
.form__group legend {
  margin-bottom: var(--space-3);
}
</style>
