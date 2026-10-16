<script setup lang="ts">
import { BaseButton, EmptyState } from '@/components/ui'
import { ROUTE_NAMES } from '@/constants'
</script>

<template>
  <div class="not-found">
    <EmptyState icon="leaf" title="Esta parcela está vacía" description="La página que buscas no existe o fue movida.">
      <RouterLink :to="{ name: ROUTE_NAMES.DASHBOARD }">
        <BaseButton icon="arrow">Volver al inicio</BaseButton>
      </RouterLink>
    </EmptyState>
  </div>
</template>

<style scoped>
.not-found {
  display: grid;
  place-items: center;
  min-height: 70vh;
}
</style>
