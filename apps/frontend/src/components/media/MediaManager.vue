<script setup lang="ts">
import { onMounted, ref, shallowRef } from 'vue'
import { BaseButton, BaseIcon, EmptyState } from '@/components/ui'
import { useAsyncAction } from '@/composables/useAsyncAction'
import type { Media, MediaOwner } from '@/models'
import { mediaService } from '@/services'

/**
 * Gestión de evidencias fotográficas de un predio, cultivo o jornada:
 * subir (con descripción), publicar/ocultar en el sitio público y eliminar.
 */
const props = withDefaults(defineProps<{ owner: MediaOwner; canEdit?: boolean }>(), { canEdit: true })

const items = shallowRef<Media[]>([])
const caption = ref('')
const input = ref<HTMLInputElement>()
const { pending, run } = useAsyncAction()

async function load() {
  items.value = await mediaService.list(props.owner)
}

async function onFiles(event: Event) {
  const files = [...((event.target as HTMLInputElement).files ?? [])]
  if (!files.length) return
  for (const file of files) {
    await run(() => mediaService.upload(file, props.owner, caption.value))
  }
  caption.value = ''
  if (input.value) input.value.value = ''
  await load()
}

async function togglePublic(media: Media) {
  await run(() => mediaService.update(media.id, { isPublic: !media.isPublic }), media.isPublic ? 'Foto oculta del sitio público' : 'Foto publicada')
  await load()
}

async function remove(media: Media) {
  if (!confirm('¿Eliminar esta foto?')) return
  await run(() => mediaService.remove(media.id), 'Foto eliminada')
  await load()
}

onMounted(() => run(load))
</script>

<template>
  <div class="media">
    <div v-if="canEdit" class="media__upload">
      <input
        v-model="caption"
        class="media__caption"
        type="text"
        maxlength="200"
        placeholder="Descripción de la foto (opcional)"
        aria-label="Descripción de la foto"
      />
      <BaseButton icon="plus" :loading="pending" @click="input?.click()">Subir fotos</BaseButton>
      <input ref="input" type="file" accept="image/jpeg,image/png,image/webp" multiple hidden @change="onFiles" />
    </div>
    <p v-if="canEdit" class="faint">JPG, PNG o WEBP de hasta 5 MB. Las fotos marcadas como públicas aparecen en el sitio.</p>

    <EmptyState v-if="!items.length" icon="leaf" title="Sin evidencias" description="Sube fotos del terreno, los cultivos o la jornada." />

    <div v-else class="media__grid">
      <figure v-for="media in items" :key="media.id" class="media__item" :class="{ 'media__item--hidden': !media.isPublic }">
        <img :src="media.url" :alt="media.caption ?? 'Evidencia'" loading="lazy" />
        <figcaption>
          <span class="media__text">{{ media.caption ?? 'Sin descripción' }}</span>
          <span v-if="canEdit" class="media__actions">
            <button
              type="button"
              :title="media.isPublic ? 'Ocultar del sitio público' : 'Publicar en el sitio'"
              @click="togglePublic(media)"
            >
              <BaseIcon :name="media.isPublic ? 'check' : 'close'" :size="14" />
              {{ media.isPublic ? 'Pública' : 'Oculta' }}
            </button>
            <button type="button" title="Eliminar" aria-label="Eliminar foto" @click="remove(media)">
              <BaseIcon name="trash" :size="14" />
            </button>
          </span>
        </figcaption>
      </figure>
    </div>
  </div>
</template>

<style scoped>
.media {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.media__upload {
  display: flex;
  gap: var(--space-3);
}
.media__caption {
  flex: 1;
  min-width: 0;
  height: 42px;
  padding: 0 var(--space-4);
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-pill);
  background: var(--surface);
  font-size: var(--text-sm);
}
.media__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: var(--space-3);
}
.media__item {
  margin: 0;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--surface);
}
.media__item--hidden img {
  opacity: 0.45;
}
.media__item img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
}
.media__item figcaption {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-xs);
}
.media__text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--ink-2);
}
.media__actions {
  display: flex;
  justify-content: space-between;
}
.media__actions button {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: 0;
  background: none;
  color: var(--ink-3);
  font-size: var(--text-xs);
  cursor: pointer;
}
.media__actions button:hover {
  color: var(--leaf-700);
}
.media__actions button:last-child:hover {
  color: var(--clay-500);
}
</style>
