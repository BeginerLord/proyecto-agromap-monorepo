<script setup lang="ts">
import EmptyState from '@/components/ui/EmptyState.vue'
import { COMMENT_AUTHOR_ROLES } from '@/constants'
import type { PublicComment } from '@/models'
import { formatDate, initials } from '@/utils/format'

defineProps<{ comments: PublicComment[] }>()
</script>

<template>
  <ul v-if="comments.length" class="comments">
    <li v-for="comment in comments" :key="comment.id" class="comment">
      <span class="comment__avatar" aria-hidden="true">{{ initials(comment.authorName) }}</span>
      <div class="comment__body">
        <div class="comment__head">
          <strong>{{ comment.authorName }}</strong>
          <span class="faint">{{ COMMENT_AUTHOR_ROLES[comment.authorRole] }} · {{ formatDate(comment.createdAt) }}</span>
          <span v-if="comment.rating" class="comment__stars" :aria-label="`${comment.rating} de 5`">
            <span v-for="n in 5" :key="n" :class="{ on: n <= comment.rating! }">●</span>
          </span>
        </div>
        <p>“{{ comment.message }}”</p>
        <span v-if="comment.distribution || comment.plot" class="faint">
          {{ comment.distribution?.title ?? comment.plot?.name }}
        </span>
      </div>
    </li>
  </ul>
  <EmptyState
    v-else
    icon="users"
    title="Aún no hay experiencias publicadas"
    description="Sé la primera persona en contar cómo vivió una jornada de apoyo."
  />
</template>

<style scoped>
.comments {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.comment {
  display: flex;
  gap: var(--space-4);
  padding: var(--space-5);
  border-radius: var(--radius-lg);
  background: var(--surface);
  border: 1px solid var(--line);
}
.comment__avatar {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border-radius: var(--radius-leaf-sm);
  background: var(--sun-100);
  color: var(--sun-700);
  font-weight: 700;
  font-size: var(--text-sm);
}
.comment__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-width: 0;
}
.comment__head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--space-2) var(--space-3);
}
.comment__body p {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  line-height: 1.45;
  color: var(--ink);
  overflow-wrap: anywhere;
}
.comment__stars {
  letter-spacing: 2px;
  font-size: 10px;
  color: var(--line-strong);
}
.comment__stars .on {
  color: var(--sun-500);
}
</style>
