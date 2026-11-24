<script setup lang="ts">
import { computed, ref } from 'vue'
import { PROJECT_VIDEOS } from '@/constants'

const activeId = ref(PROJECT_VIDEOS[0]!.id)
const active = computed(() => PROJECT_VIDEOS.find((v) => v.id === activeId.value) ?? PROJECT_VIDEOS[0]!)

const select = (id: string, available: boolean) => {
  if (available) activeId.value = id
}
</script>

<template>
  <div class="videos">
    <figure class="videos__player">
      <!-- key: al cambiar de video se recrea el reproductor -->
      <video :key="active.id" :src="active.src" controls preload="metadata" playsinline />
      <figcaption>
        <strong>{{ active.title }}</strong>
        <span>{{ active.description }}</span>
      </figcaption>
    </figure>

    <ol class="videos__list" aria-label="Lista de videos">
      <li v-for="(video, index) in PROJECT_VIDEOS" :key="video.id">
        <button
          type="button"
          class="item"
          :class="{ 'item--active': video.id === activeId, 'item--soon': !video.src }"
          :disabled="!video.src"
          :aria-current="video.id === activeId ? 'true' : undefined"
          @click="select(video.id, !!video.src)"
        >
          <span class="item__num num">{{ index + 1 }}</span>
          <span class="item__text">
            <strong>{{ video.title }}</strong>
            <small>{{ video.src ? (video.id === activeId ? 'Reproduciendo' : 'Ver video') : 'Próximamente' }}</small>
          </span>
        </button>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.videos {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  gap: var(--space-5);
  align-items: start;
}
.videos__player {
  margin: 0;
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-leaf);
  overflow: hidden;
  background: var(--surface);
  border: 1px solid var(--line);
}
.videos__player video {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: var(--leaf-900);
}
.videos__player figcaption {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: var(--space-4) var(--space-5);
}
.videos__player figcaption span {
  color: var(--ink-2);
  font-size: var(--text-sm);
}
.videos__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin: 0;
  padding: 0;
  list-style: none;
}
.item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  width: 100%;
  padding: var(--space-4);
  text-align: left;
  font: inherit;
  color: var(--ink);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  cursor: pointer;
}
.item:hover:not(:disabled) {
  border-color: var(--leaf-600);
}
.item:focus-visible {
  outline: 3px solid var(--leaf-300);
  outline-offset: 2px;
}
.item--active {
  border-color: var(--leaf-700);
  background: var(--leaf-50);
}
.item--soon {
  cursor: default;
  opacity: 0.65;
}
.item__num {
  display: grid;
  place-items: center;
  flex: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--leaf-100);
  color: var(--leaf-700);
  font-weight: 700;
}
.item--active .item__num {
  background: var(--leaf-700);
  color: #fff;
}
.item__text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.item__text small {
  color: var(--ink-3);
}
@media (max-width: 860px) {
  .videos {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
