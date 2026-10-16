<script setup lang="ts">
defineProps<{ title: string; eyebrow?: string; description?: string }>()
</script>

<template>
  <header class="page-header">
    <div class="page-header__text">
      <span v-if="eyebrow" class="eyebrow">{{ eyebrow }}</span>
      <h1>{{ title }}</h1>
      <p v-if="description" class="muted">{{ description }}</p>
    </div>
    <div v-if="$slots.actions" class="page-header__actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;
  margin-bottom: var(--space-8);
}
.page-header__text {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
.page-header h1 {
  font-size: clamp(1.75rem, 1.2rem + 1.6vw, 2.25rem);
}
.page-header p {
  max-width: 620px;
}
.page-header__actions {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
}
</style>
