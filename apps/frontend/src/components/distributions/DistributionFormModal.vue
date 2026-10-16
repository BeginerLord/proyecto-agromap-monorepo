<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { BaseButton, BaseIcon, BaseInput, BaseModal, BaseTextarea, EmptyState } from '@/components/ui'
import { useAsyncAction } from '@/composables/useAsyncAction'
import type { Distribution, Harvest } from '@/models'
import { distributionService, harvestService } from '@/services'
import { formatKg, formatShortDate, fromDateInput } from '@/utils/format'

const open = defineModel<boolean>('open', { required: true })
const emit = defineEmits<{ saved: [distribution: Distribution] }>()

const harvests = ref<Harvest[]>([])
const quantities = reactive<Record<string, number | ''>>({})
const form = reactive({ date: distributionService.today(), title: '', beneficiaries: '' as number | '', notes: '' })
const { pending, run } = useAsyncAction()

watch(open, async (value) => {
  if (!value) return
  Object.assign(form, { date: distributionService.today(), title: '', beneficiaries: '', notes: '' })
  harvests.value = await harvestService.available()
  for (const key of Object.keys(quantities)) delete quantities[key]
})

const items = computed(() =>
  Object.entries(quantities)
    .filter(([, qty]) => typeof qty === 'number' && qty > 0)
    .map(([harvestId, qty]) => ({ harvestId, quantityKg: qty as number })),
)
const totalKg = computed(() => items.value.reduce((sum, item) => sum + item.quantityKg, 0))

async function submit() {
  const saved = await run(
    () =>
      distributionService.create({
        date: fromDateInput(form.date)!,
        title: form.title.trim() || undefined,
        items: items.value,
        beneficiaries: typeof form.beneficiaries === 'number' ? form.beneficiaries : 0,
        notes: form.notes.trim() || undefined,
      }),
    'Entrega registrada',
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
    title="Registrar entrega"
    description="Selecciona cuántos kilos de cada cosecha se entregaron en la jornada."
    :width="680"
  >
    <form id="dist-form" class="stack" @submit.prevent="submit">
      <div class="grid grid--3">
        <BaseInput v-model="form.date" label="Fecha de la jornada" type="date" required />
        <BaseInput v-model="form.beneficiaries" label="Estudiantes beneficiados" type="number" min="0" required />
        <BaseInput v-model="form.title" label="Título (opcional)" />
      </div>

      <div class="items">
        <span class="eyebrow">Cosechas disponibles</span>
        <EmptyState
          v-if="!harvests.length"
          icon="basket"
          title="No hay kilos disponibles"
          description="Registra una cosecha antes de crear la entrega."
        />
        <div v-for="harvest in harvests" :key="harvest.id" class="item">
          <span class="item__icon"><BaseIcon name="basket" :size="16" /></span>
          <div class="item__meta">
            <strong>{{ harvest.crop.species }}</strong>
            <span class="faint">{{ harvest.plot.name }} · {{ formatShortDate(harvest.harvestedAt) }} · disp. {{ formatKg(harvest.availableKg) }}</span>
          </div>
          <input
            v-model.number="quantities[harvest.id]"
            class="item__qty"
            type="number"
            min="0"
            step="0.1"
            :max="harvest.availableKg"
            placeholder="0 kg"
            :aria-label="`Kilos de ${harvest.crop.species}`"
          />
        </div>
      </div>

      <BaseTextarea v-model="form.notes" label="Notas" :rows="2" />
    </form>
    <template #footer>
      <span class="total num">Total: <strong>{{ formatKg(totalKg) }}</strong></span>
      <BaseButton variant="ghost" @click="open = false">Cancelar</BaseButton>
      <BaseButton type="submit" form="dist-form" :loading="pending" :disabled="!items.length" icon="check">
        Registrar entrega
      </BaseButton>
    </template>
  </BaseModal>
</template>

<style scoped>
.items {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
}
.item__icon {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: var(--radius-leaf-sm);
  background: var(--sun-100);
  color: var(--sun-700);
}
.item__meta {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}
.item__qty {
  width: 96px;
  height: 38px;
  padding: 0 var(--space-3);
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-sm);
  text-align: right;
}
.total {
  margin-right: auto;
  align-self: center;
  font-size: var(--text-sm);
}
</style>
