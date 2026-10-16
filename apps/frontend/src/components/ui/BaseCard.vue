<script setup lang="ts">
withDefaults(defineProps<{ padding?: 'none' | 'md' | 'lg'; leaf?: boolean; interactive?: boolean }>(), {
  padding: 'md',
})
</script>

<template>
  <section
    class="card"
    :class="[`card--pad-${padding}`, { 'card--leaf': leaf, 'card--interactive': interactive }]"
  >
    <header v-if="$slots.header" class="card__header">
      <slot name="header" />
    </header>
    <slot />
  </section>
</template>

<style scoped>
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  min-width: 0;
}
.card--leaf {
  border-radius: var(--radius-leaf);
}
.card--pad-md {
  padding: var(--space-5);
}
.card--pad-lg {
  padding: var(--space-8);
}
.card--interactive {
  transition:
    border-color var(--transition),
    transform var(--transition);
  cursor: pointer;
}
.card--interactive:hover {
  border-color: var(--leaf-300);
  transform: translateY(-2px);
}
.card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}
.card__header :deep(h3) {
  font-size: var(--text-lg);
}
</style>
