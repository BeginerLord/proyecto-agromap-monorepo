<script setup lang="ts">
import { useToastStore } from '@/stores/toast.store'
import BaseIcon from './BaseIcon.vue'

const toast = useToastStore()
const ICON = { success: 'check', error: 'close', info: 'leaf' } as const
</script>

<template>
  <div class="toasts" aria-live="polite">
    <TransitionGroup name="toast">
      <div v-for="item in toast.toasts" :key="item.id" class="toast" :class="`toast--${item.kind}`">
        <span class="toast__icon"><BaseIcon :name="ICON[item.kind]" :size="15" :stroke-width="2.4" /></span>
        <span>{{ item.message }}</span>
        <button type="button" class="toast__close" aria-label="Cerrar" @click="toast.dismiss(item.id)">
          <BaseIcon name="close" :size="14" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toasts {
  position: fixed;
  right: var(--space-5);
  bottom: var(--space-5);
  z-index: 1100;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  max-width: min(420px, calc(100vw - 32px));
}
.toast {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-leaf-sm);
  background: var(--ink);
  color: #fff;
  font-size: var(--text-sm);
  box-shadow: var(--shadow-md);
}
.toast__icon {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  flex-shrink: 0;
}
.toast--success .toast__icon {
  background: var(--leaf-600);
}
.toast--error .toast__icon {
  background: var(--clay-500);
}
.toast--info .toast__icon {
  background: var(--water-500);
}
.toast__close {
  margin-left: auto;
  border: 0;
  background: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
}
.toast-enter-active,
.toast-leave-active {
  transition: all 200ms ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
