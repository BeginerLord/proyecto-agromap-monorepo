<script setup lang="ts">
import BaseIcon from './BaseIcon.vue'

defineProps<{ placeholder?: string }>()
const model = defineModel<string>()
</script>

<template>
  <label class="search">
    <BaseIcon name="search" :size="17" />
    <span class="sr-only">Buscar</span>
    <input v-model="model" type="search" :placeholder="placeholder ?? 'Buscar…'" />
  </label>
</template>

<style scoped>
.search {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  height: 42px;
  min-width: 240px;
  padding: 0 var(--space-4);
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-pill);
  background: var(--color-surface);
  color: var(--ink-3);
}
.search:focus-within {
  border-color: var(--leaf-600);
  box-shadow: 0 0 0 3px var(--leaf-100);
}
.search input {
  flex: 1;
  border: 0;
  outline: none;
  background: transparent;
  font-size: var(--text-sm);
  color: var(--ink);
}
</style>
