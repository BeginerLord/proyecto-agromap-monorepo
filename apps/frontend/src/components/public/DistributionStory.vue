<script setup lang="ts">
import BaseIcon from '@/components/ui/BaseIcon.vue'
import type { PublicDistribution } from '@/models'
import PhotoGallery from './PhotoGallery.vue'

/** Relato de una jornada de apoyo: año, estudiantes atendidos y fotos. */
defineProps<{ distribution: PublicDistribution; compact?: boolean }>()

const yearOf = (date: string) => new Date(date).getFullYear()
</script>

<template>
  <article class="story">
    <header class="story__head">
      <div class="story__date">
        <span class="eyebrow">{{ yearOf(distribution.date) }}</span>
        <h3>{{ distribution.title }}</h3>
      </div>
      <div class="story__kpis">
        <span><BaseIcon name="users" :size="16" /> <strong class="num">{{ distribution.beneficiaries }}</strong> estudiantes</span>
        <span v-if="distribution.commentCount">
          <BaseIcon name="notebook" :size="16" /> {{ distribution.commentCount }} experiencias
        </span>
      </div>
    </header>

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
</style>
