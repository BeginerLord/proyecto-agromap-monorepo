<script setup lang="ts">
/** Envoltorio de etiqueta + ayuda + error para cualquier control de formulario. */
defineProps<{ label?: string; hint?: string; error?: string; required?: boolean; for?: string }>()
</script>

<template>
  <div class="field" :class="{ 'field--error': !!error }">
    <label v-if="label" class="field__label" :for="$props.for">
      {{ label }}<span v-if="required" class="field__req" aria-hidden="true">*</span>
    </label>
    <slot />
    <p v-if="error" class="field__error" role="alert">{{ error }}</p>
    <p v-else-if="hint" class="field__hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}
.field__label {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-soft);
}
.field__req {
  color: var(--clay-500);
  margin-left: 2px;
}
.field__hint {
  font-size: var(--text-xs);
  color: var(--color-text-faint);
}
.field__error {
  font-size: var(--text-xs);
  color: var(--clay-700);
}
.field--error :deep(.control) {
  border-color: var(--clay-500);
}

/* Estilo compartido por input/select/textarea dentro de un BaseField */
.field :deep(.control) {
  width: 100%;
  min-height: 42px;
  padding: 0 var(--space-4);
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  font-size: var(--text-sm);
  transition:
    border-color var(--transition),
    box-shadow var(--transition);
}
.field :deep(textarea.control) {
  padding: var(--space-3) var(--space-4);
  min-height: 96px;
  resize: vertical;
}
.field :deep(.control:focus) {
  outline: none;
  border-color: var(--leaf-600);
  box-shadow: 0 0 0 3px var(--leaf-100);
}
.field :deep(.control::placeholder) {
  color: var(--ink-3);
}
</style>
