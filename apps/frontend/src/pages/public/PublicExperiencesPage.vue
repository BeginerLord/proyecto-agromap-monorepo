<script setup lang="ts">
import { onMounted, shallowRef } from 'vue'
import CommentForm from '@/components/public/CommentForm.vue'
import CommentList from '@/components/public/CommentList.vue'
import { BasePagination, PageHeader } from '@/components/ui'
import { usePaginatedList } from '@/composables/usePaginatedList'
import type { PublicComment, PublicCommentQuery } from '@/models'
import { publicService } from '@/services'

const distributions = shallowRef<{ id: string; title: string }[]>([])
const { items, meta, page, load } = usePaginatedList<PublicComment, PublicCommentQuery>(
  (query) => publicService.comments(query),
  {},
)

onMounted(async () => {
  await load()
  const recent = await publicService.distributions({ limit: 20 }).catch(() => null)
  distributions.value = recent?.data.map(({ id, title }) => ({ id, title })) ?? []
})
</script>

<template>
  <div>
    <PageHeader
      eyebrow="Voces de la comunidad"
      title="Experiencias"
      description="Estudiantes, familias agricultoras, docentes y voluntarios cuentan cómo viven las jornadas de apoyo y el trabajo en los predios."
    />

    <div class="layout">
      <section class="stack">
        <CommentList :comments="items" />
        <BasePagination v-model="page" :meta="meta" />
      </section>
      <aside class="layout__form">
        <h3>Comparte tu experiencia</h3>
        <p class="muted">Tu testimonio ayuda a mejorar el proyecto y a que más personas se sumen.</p>
        <CommentForm :distributions="distributions" />
      </aside>
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
  gap: var(--space-8);
  align-items: start;
}
.layout__form {
  position: sticky;
  top: calc(68px + var(--space-6));
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
@media (max-width: 900px) {
  .layout {
    grid-template-columns: 1fr;
  }
  .layout__form {
    position: static;
    order: -1;
  }
}
</style>
