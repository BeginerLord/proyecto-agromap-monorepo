<script setup lang="ts">
import { useId } from 'vue'
import BaseField from './BaseField.vue'

defineProps<{ label?: string; hint?: string; error?: string; required?: boolean; placeholder?: string; rows?: number }>()
const model = defineModel<string>()
const id = useId()
</script>

<template>
  <BaseField :label="label" :hint="hint" :error="error" :required="required" :for="id">
    <textarea
      :id="id"
      v-model="model"
      class="control"
      :rows="rows ?? 4"
      :placeholder="placeholder"
      :required="required"
    />
  </BaseField>
</template>
