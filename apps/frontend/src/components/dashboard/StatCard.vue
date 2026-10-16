<script setup lang="ts">
import BaseIcon, { type IconName } from '@/components/ui/BaseIcon.vue'
import type { Tone } from '@/constants/labels'

withDefaults(defineProps<{ label: string; value: string | number; hint?: string; icon: IconName; tone?: Tone }>(), {
  tone: 'leaf',
})
</script>

<template>
  <article class="stat" :class="`stat--${tone}`">
    <span class="stat__icon"><BaseIcon :name="icon" :size="20" /></span>
    <div class="stat__body">
      <span class="stat__label">{{ label }}</span>
      <strong class="stat__value num">{{ value }}</strong>
      <span v-if="hint" class="faint">{{ hint }}</span>
    </div>
  </article>
</template>

<style scoped>
.stat {
  display: flex;
  gap: var(--space-4);
  align-items: flex-start;
  padding: var(--space-5);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
}
.stat__icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: var(--radius-leaf-sm);
}
.stat--leaf .stat__icon {
  background: var(--leaf-100);
  color: var(--leaf-700);
}
.stat--sun .stat__icon {
  background: var(--sun-100);
  color: var(--sun-700);
}
.stat--soil .stat__icon {
  background: var(--soil-100);
  color: var(--soil-700);
}
.stat--water .stat__icon {
  background: var(--water-100);
  color: var(--water-700);
}
.stat--clay .stat__icon {
  background: var(--clay-100);
  color: var(--clay-700);
}
.stat__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.stat__label {
  font-size: var(--text-sm);
  color: var(--ink-2);
}
.stat__value {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: 600;
  line-height: 1.15;
}
</style>
