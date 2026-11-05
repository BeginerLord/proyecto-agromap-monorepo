<script setup lang="ts">
import logoUdec from '@/assets/logo-udec.svg'

/** Firma institucional: escudo de la Universidad de Cartagena + Centro Tutorial Cereté. */
withDefaults(defineProps<{ size?: number; inverse?: boolean }>(), { size: 52 })
</script>

<template>
  <div class="udec" :class="{ 'udec--inverse': inverse }">
    <img :src="logoUdec" alt="Escudo de la Universidad de Cartagena" :width="size" :height="size" class="udec__logo" />
    <span class="udec__text">
      <strong>Centro Tutorial Cereté</strong>
      <span>Universidad de Cartagena</span>
    </span>
  </div>
</template>

<style scoped>
.udec {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
.udec__logo {
  object-fit: contain;
  flex-shrink: 0;
}
.udec__text {
  display: flex;
  flex-direction: column;
  line-height: 1.25;
  font-size: var(--text-sm);
  color: var(--ink-2);
}
.udec__text strong {
  color: var(--ink);
  font-weight: 600;
}
.udec--inverse .udec__text,
.udec--inverse .udec__text strong {
  color: var(--leaf-100);
}
</style>
