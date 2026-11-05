<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import type { PublicMedia } from '@/models'
import { formatDate } from '@/utils/format'

/** Galería de evidencias con visor ampliado (teclado: ← → Esc). */
const props = withDefaults(defineProps<{ photos: PublicMedia[]; columns?: number; emptyText?: string }>(), {
  columns: 3,
  emptyText: 'Aún no hay fotos publicadas.',
})

const current = ref<number | null>(null)
const photo = computed(() => (current.value === null ? null : props.photos[current.value]))

function move(step: number) {
  if (current.value === null) return
  current.value = (current.value + step + props.photos.length) % props.photos.length
}

function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape') current.value = null
  if (event.key === 'ArrowRight') move(1)
  if (event.key === 'ArrowLeft') move(-1)
}

watch(current, (value) => {
  document.body.style.overflow = value === null ? '' : 'hidden'
  if (value === null) window.removeEventListener('keydown', onKey)
  else window.addEventListener('keydown', onKey)
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKey)
})

const describe = (p: PublicMedia) =>
  [p.caption, p.crop?.species, p.plot?.name].filter(Boolean).join(' · ') || 'Evidencia de campo'
</script>

<template>
  <div v-if="photos.length" class="gallery" :style="{ '--cols': columns }">
    <button
      v-for="(item, index) in photos"
      :key="item.id"
      type="button"
      class="gallery__item"
      :aria-label="`Ver foto: ${describe(item)}`"
      @click="current = index"
    >
      <img :src="item.url" :alt="describe(item)" loading="lazy" />
      <span v-if="item.caption" class="gallery__caption">{{ item.caption }}</span>
    </button>
  </div>
  <EmptyState v-else icon="leaf" :title="emptyText" description="El equipo publica fotos de los cultivos y de cada jornada." />

  <Teleport to="body">
    <div v-if="photo" class="viewer" role="dialog" aria-modal="true" @click.self="current = null">
      <button class="viewer__btn viewer__close" type="button" aria-label="Cerrar" @click="current = null">
        <BaseIcon name="close" />
      </button>
      <button v-if="photos.length > 1" class="viewer__btn viewer__prev" type="button" aria-label="Anterior" @click="move(-1)">
        <BaseIcon name="chevron-left" />
      </button>
      <figure class="viewer__figure">
        <img :src="photo.url" :alt="describe(photo)" />
        <figcaption>
          <strong>{{ describe(photo) }}</strong>
          <span>{{ formatDate(photo.takenAt ?? photo.createdAt) }}</span>
        </figcaption>
      </figure>
      <button v-if="photos.length > 1" class="viewer__btn viewer__next" type="button" aria-label="Siguiente" @click="move(1)">
        <BaseIcon name="chevron-right" />
      </button>
    </div>
  </Teleport>
</template>

<style scoped>
.gallery {
  display: grid;
  grid-template-columns: repeat(var(--cols), minmax(0, 1fr));
  gap: var(--space-3);
}
.gallery__item {
  position: relative;
  aspect-ratio: 4 / 3;
  padding: 0;
  border: 0;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--sand);
  cursor: zoom-in;
}
.gallery__item:nth-child(3n + 1) {
  border-radius: var(--radius-leaf-sm);
}
.gallery__item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 300ms ease;
}
.gallery__item:hover img {
  transform: scale(1.04);
}
.gallery__caption {
  position: absolute;
  left: var(--space-2);
  bottom: var(--space-2);
  max-width: calc(100% - 16px);
  padding: 2px var(--space-2);
  border-radius: var(--radius-pill);
  background: rgba(30, 43, 33, 0.72);
  color: #fff;
  font-size: var(--text-xs);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.viewer {
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: grid;
  place-items: center;
  padding: var(--space-8);
  background: rgba(16, 24, 18, 0.9);
}
.viewer__figure {
  margin: 0;
  max-width: min(1100px, 100%);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.viewer__figure img {
  max-height: 78vh;
  width: auto;
  margin: 0 auto;
  border-radius: var(--radius-md);
}
.viewer__figure figcaption {
  display: flex;
  justify-content: space-between;
  gap: var(--space-4);
  color: var(--leaf-100);
  font-size: var(--text-sm);
}
.viewer__btn {
  position: absolute;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  cursor: pointer;
}
.viewer__btn:hover {
  background: rgba(255, 255, 255, 0.24);
}
.viewer__close {
  top: var(--space-5);
  right: var(--space-5);
}
.viewer__prev {
  left: var(--space-5);
}
.viewer__next {
  right: var(--space-5);
}
@media (max-width: 640px) {
  .gallery {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
