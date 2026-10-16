<script setup lang="ts">
import type { PaginationMeta } from '@/models'
import BaseIcon from './BaseIcon.vue'

defineProps<{ meta: PaginationMeta }>()
const page = defineModel<number>({ required: true })
</script>

<template>
  <nav v-if="meta.totalPages > 1" class="pager" aria-label="Paginación">
    <span class="faint num">{{ meta.total }} registros · página {{ meta.page }} de {{ meta.totalPages }}</span>
    <div class="row">
      <button class="pager__btn" type="button" :disabled="page <= 1" aria-label="Anterior" @click="page--">
        <BaseIcon name="chevron-left" />
      </button>
      <button
        class="pager__btn"
        type="button"
        :disabled="page >= meta.totalPages"
        aria-label="Siguiente"
        @click="page++"
      >
        <BaseIcon name="chevron-right" />
      </button>
    </div>
  </nav>
</template>

<style scoped>
.pager {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding-top: var(--space-4);
}
.pager__btn {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--line-strong);
  border-radius: 50%;
  background: var(--color-surface);
  cursor: pointer;
}
.pager__btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.pager__btn:hover:not(:disabled) {
  border-color: var(--leaf-300);
  background: var(--leaf-50);
}
</style>
