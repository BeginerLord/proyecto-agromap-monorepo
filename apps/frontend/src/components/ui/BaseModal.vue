<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'
import BaseIcon from './BaseIcon.vue'

const props = withDefaults(defineProps<{ title: string; description?: string; width?: number }>(), { width: 560 })
const open = defineModel<boolean>('open', { required: true })

function close() {
  open.value = false
}

function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
}

watch(
  open,
  (value) => {
    document.body.style.overflow = value ? 'hidden' : ''
    if (value) window.addEventListener('keydown', onKey)
    else window.removeEventListener('keydown', onKey)
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="overlay" @mousedown.self="close">
        <div class="modal" role="dialog" aria-modal="true" :aria-label="title" :style="{ maxWidth: `${props.width}px` }">
          <header class="modal__header">
            <div>
              <h3>{{ title }}</h3>
              <p v-if="description" class="faint">{{ description }}</p>
            </div>
            <button class="modal__close" type="button" aria-label="Cerrar" @click="close">
              <BaseIcon name="close" />
            </button>
          </header>
          <div class="modal__body">
            <slot />
          </div>
          <footer v-if="$slots.footer" class="modal__footer">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: var(--space-4);
  background: rgba(30, 43, 33, 0.38);
}
.modal {
  width: 100%;
  max-height: calc(100vh - 32px);
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  border-radius: var(--radius-leaf);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}
.modal__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-4);
  padding: var(--space-6) var(--space-6) var(--space-4);
}
.modal__close {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 50%;
  background: var(--sand);
  color: var(--ink-2);
  cursor: pointer;
}
.modal__close:hover {
  background: var(--line);
}
.modal__body {
  padding: 0 var(--space-6) var(--space-6);
  overflow-y: auto;
}
.modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--color-border);
  background: var(--paper);
}
.modal-enter-active,
.modal-leave-active {
  transition: opacity 160ms ease;
}
.modal-enter-active .modal,
.modal-leave-active .modal {
  transition: transform 180ms ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal {
  transform: translateY(12px) scale(0.98);
}
</style>
