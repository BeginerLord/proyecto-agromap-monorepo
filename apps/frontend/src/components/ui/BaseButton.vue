<script setup lang="ts">
import BaseIcon, { type IconName } from './BaseIcon.vue'

withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    size?: 'sm' | 'md'
    type?: 'button' | 'submit'
    icon?: IconName
    loading?: boolean
    disabled?: boolean
    block?: boolean
  }>(),
  { variant: 'primary', size: 'md', type: 'button' },
)
</script>

<template>
  <button
    :type="type"
    class="btn"
    :class="[`btn--${variant}`, `btn--${size}`, { 'btn--block': block }]"
    :disabled="disabled || loading"
    :aria-busy="loading"
  >
    <span v-if="loading" class="btn__spinner" aria-hidden="true" />
    <BaseIcon v-else-if="icon" :name="icon" :size="size === 'sm' ? 15 : 17" />
    <span v-if="$slots.default"><slot /></span>
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  border: 1px solid transparent;
  border-radius: var(--radius-pill);
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition:
    background var(--transition),
    border-color var(--transition),
    color var(--transition);
}
.btn--md {
  height: 42px;
  padding: 0 var(--space-5);
  font-size: var(--text-sm);
}
.btn--sm {
  height: 34px;
  padding: 0 var(--space-4);
  font-size: var(--text-xs);
}
.btn--block {
  width: 100%;
}
.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.btn--primary {
  background: var(--color-primary);
  color: #fff;
}
.btn--primary:hover:not(:disabled) {
  background: var(--color-primary-hover);
}
.btn--secondary {
  background: var(--color-surface);
  border-color: var(--line-strong);
  color: var(--color-text);
}
.btn--secondary:hover:not(:disabled) {
  background: var(--leaf-50);
  border-color: var(--leaf-300);
}
.btn--ghost {
  background: transparent;
  color: var(--color-text-soft);
}
.btn--ghost:hover:not(:disabled) {
  background: var(--sand);
  color: var(--color-text);
}
.btn--danger {
  background: var(--clay-100);
  color: var(--clay-700);
}
.btn--danger:hover:not(:disabled) {
  background: var(--clay-500);
  color: #fff;
}

.btn__spinner {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  border: 2px solid currentColor;
  border-right-color: transparent;
  animation: spin 0.7s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
