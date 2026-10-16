<script setup lang="ts">
import BaseIcon from '@/components/ui/BaseIcon.vue'
import type { PublicDistribution } from '@/models'
import { formatDate, formatKg } from '@/utils/format'
import PhotoGallery from './PhotoGallery.vue'

/** Relato de una jornada de apoyo: indicadores, alimentos entregados y fotos. */
defineProps<{ distribution: PublicDistribution; compact?: boolean }>()
</script>

<template>
  <article class="story">
    <header class="story__head">
      <div class="story__date">
        <span class="eyebrow">{{ formatDate(distribution.date) }}</span>
        <h3>{{ distribution.title }}</h3>
      </div>
      <div class="story__kpis">
        <span><BaseIcon name="scale" :size="16" /> <strong class="num">{{ formatKg(distribution.totalKg) }}</strong></span>
        <span><BaseIcon name="users" :size="16" /> <strong class="num">{{ distribution.beneficiaries }}</strong> estudiantes</span>
        <span v-if="distribution.commentCount">
          <BaseIcon name="notebook" :size="16" /> {{ distribution.commentCount }} experiencias
        </span>
      </div>
    </header>

    <ul class="story__items">
      <li v-for="item in distribution.items" :key="item.species">
        {{ item.species }} <span class="num">{{ formatKg(item.quantityKg) }}</span>
      </li>
    </ul>

    <p v-if="distribution.notes && !compact" class="muted">{{ distribution.notes }}</p>

    <PhotoGallery
      v-if="distribution.photos.length || !compact"
      :photos="compact ? distribution.photos.slice(0, 3) : distribution.photos"
      :columns="compact ? 3 : 4"
      empty-text="Esta jornada aún no tiene fotos"
    />
  </article>
</template>

<style scoped>
.story {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-6);
  border: 1px solid var(--line);
  border-radius: var(--radius-leaf);
  background: var(--surface);
}
.story__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: var(--space-3);
}
.story__kpis {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-5);
  font-size: var(--text-sm);
  color: var(--ink-2);
}
.story__kpis span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.story__kpis strong {
  color: var(--ink);
}
.story__items {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}
.story__items li {
  display: inline-flex;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-pill);
  background: var(--sun-100);
  color: var(--sun-700);
  font-size: var(--text-sm);
  font-weight: 600;
}
.story__items li span {
  color: var(--ink-2);
  font-weight: 500;
}
</style>
