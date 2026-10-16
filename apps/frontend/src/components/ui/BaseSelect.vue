<script setup lang="ts">
import { useId } from 'vue'
import BaseField from './BaseField.vue'

export interface SelectOption {
  value: string
  label: string
}

defineProps<{
  label?: string
  hint?: string
  error?: string
  required?: boolean
  options: SelectOption[]
  placeholder?: string
}>()

const model = defineModel<string>()
const id = useId()
</script>

<template>
  <BaseField :label="label" :hint="hint" :error="error" :required="required" :for="id">
    <select :id="id" v-model="model" class="control select" :required="required">
      <option v-if="placeholder !== undefined" value="">{{ placeholder }}</option>
      <option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
    </select>
  </BaseField>
</template>

<style scoped>
.select {
  appearance: none;
  padding-right: var(--space-10) !important;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23879284' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  cursor: pointer;
}
</style>
