<script setup lang="ts">
import BaseIcon, { type IconName } from './BaseIcon.vue'

withDefaults(defineProps<{ title: string; description?: string; icon?: IconName }>(), { icon: 'sprout' })
</script>

<template>
  <div class="empty">
    <div class="empty__mark" aria-hidden="true">
      <BaseIcon :name="icon" :size="26" />
    </div>
    <h4>{{ title }}</h4>
    <p v-if="description" class="muted">{{ description }}</p>
    <div v-if="$slots.default" class="empty__actions"><slot /></div>
  </div>
</template>

<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-2);
  padding: var(--space-12) var(--space-6);
}
.empty__mark {
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  margin-bottom: var(--space-2);
  border-radius: var(--radius-leaf-sm);
  background: var(--leaf-100);
  color: var(--leaf-700);
}
.empty p {
  max-width: 380px;
  font-size: var(--text-sm);
}
.empty__actions {
  margin-top: var(--space-3);
}
</style>
