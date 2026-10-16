<script setup lang="ts">
import { useId } from 'vue'
import BaseField from './BaseField.vue'

defineProps<{
  label?: string
  hint?: string
  error?: string
  required?: boolean
  type?: string
  placeholder?: string
  autocomplete?: string
  min?: number | string
  max?: number | string
  step?: number | string
}>()

const model = defineModel<string | number | null>()
const id = useId()
</script>

<template>
  <BaseField :label="label" :hint="hint" :error="error" :required="required" :for="id">
    <input
      :id="id"
      v-model="model"
      class="control"
      :type="type ?? 'text'"
      :placeholder="placeholder"
      :required="required"
      :autocomplete="autocomplete"
      :min="min"
      :max="max"
      :step="step"
      :aria-invalid="!!error"
    />
  </BaseField>
</template>
