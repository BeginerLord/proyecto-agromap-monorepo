<script setup lang="ts">
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import { FIELD_LOG_TYPES } from '@/constants/labels'
import type { FieldLog } from '@/models'
import { formatDate } from '@/utils/format'

defineProps<{ logs: FieldLog[]; removable?: (log: FieldLog) => boolean }>()
const emit = defineEmits<{ remove: [log: FieldLog] }>()
</script>

<template>
  <ul class="logs">
    <li v-for="log in logs" :key="log.id" class="log">
      <div class="log__head">
        <BaseBadge :tone="FIELD_LOG_TYPES[log.type].tone">{{ FIELD_LOG_TYPES[log.type].label }}</BaseBadge>
        <span class="faint">{{ formatDate(log.date) }}</span>
        <button
          v-if="removable?.(log)"
          type="button"
          class="log__remove"
          aria-label="Eliminar registro"
          @click="emit('remove', log)"
        >
          <BaseIcon name="trash" :size="15" />
        </button>
      </div>
      <p>{{ log.description }}</p>
      <span class="faint">
        {{ log.crop.species }} · {{ log.plot.name }} · por {{ log.author.name }}
      </span>
    </li>
  </ul>
</template>

<style scoped>
.logs {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}
.log {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-4) 0;
  border-bottom: 1px dashed var(--line);
}
.log:first-child {
  padding-top: 0;
}
.log:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}
.log__head {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
.log__remove {
  margin-left: auto;
  border: 0;
  background: none;
  color: var(--ink-3);
  cursor: pointer;
}
.log__remove:hover {
  color: var(--clay-500);
}
.log p {
  font-size: var(--text-sm);
}
</style>
