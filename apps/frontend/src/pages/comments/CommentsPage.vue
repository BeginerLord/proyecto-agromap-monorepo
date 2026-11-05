<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { BaseBadge, BaseButton, BaseCard, BasePagination, EmptyState, PageHeader } from '@/components/ui'
import { useAsyncAction } from '@/composables/useAsyncAction'
import { usePaginatedList } from '@/composables/usePaginatedList'
import { COMMENT_AUTHOR_ROLES, COMMENT_STATUS } from '@/constants'
import type { Comment, CommentQuery, CommentStatus } from '@/models'
import { commentService } from '@/services'
import { formatDateTime } from '@/utils/format'

const stats = ref<Record<string, number>>({})
const { run } = useAsyncAction()
const { items, meta, loading, filters, page, load } = usePaginatedList<Comment, CommentQuery>(
  (query) => commentService.list(query),
  { status: 'pending' as CommentStatus },
)

const tabs: CommentStatus[] = ['pending', 'approved', 'rejected']

async function refresh() {
  await load()
  stats.value = await commentService.stats()
}

async function act(action: () => Promise<unknown>, message: string) {
  await run(action, message)
  await refresh()
}

const approve = (comment: Comment) => act(() => commentService.approve(comment.id), 'Comentario publicado')
const reject = (comment: Comment) => act(() => commentService.reject(comment.id), 'Comentario rechazado')
const remove = (comment: Comment) => act(() => commentService.remove(comment.id), 'Comentario eliminado')

onMounted(refresh)
</script>

<template>
  <div>
    <PageHeader
      eyebrow="Sitio público"
      title="Experiencias"
      description="Los comentarios enviados desde el sitio público se publican solo después de aprobarlos."
    />

    <div class="tabs" role="tablist">
      <button
        v-for="tab in tabs"
        :key="tab"
        role="tab"
        type="button"
        class="tab"
        :class="{ 'tab--on': filters.status === tab }"
        :aria-selected="filters.status === tab"
        @click="filters.status = tab"
      >
        {{ COMMENT_STATUS[tab].label }}
        <span class="tab__count num">{{ stats[tab] ?? 0 }}</span>
      </button>
    </div>

    <EmptyState v-if="!loading && !items.length" icon="users" title="No hay comentarios en esta bandeja" />

    <div class="stack">
      <BaseCard v-for="comment in items" :key="comment.id">
        <div class="comment">
          <div class="comment__head">
            <strong>{{ comment.authorName }}</strong>
            <span class="faint">{{ COMMENT_AUTHOR_ROLES[comment.authorRole] }} · {{ formatDateTime(comment.createdAt) }}</span>
            <span v-if="comment.rating" class="faint">· {{ comment.rating }}/5</span>
            <BaseBadge :tone="COMMENT_STATUS[comment.status].tone">{{ COMMENT_STATUS[comment.status].label }}</BaseBadge>
          </div>
          <p>{{ comment.message }}</p>
          <span v-if="comment.distribution || comment.plot" class="faint">
            Sobre: {{ comment.distribution?.title ?? comment.plot?.name }}
          </span>
          <span v-if="comment.moderatedBy" class="faint">
            Moderado por {{ comment.moderatedBy.name }} · {{ formatDateTime(comment.moderatedAt) }}
          </span>
          <div class="comment__actions">
            <BaseButton
              v-if="comment.status !== 'approved'"
              size="sm"
              icon="check"
              @click="approve(comment)"
            >
              Aprobar
            </BaseButton>
            <BaseButton
              v-if="comment.status !== 'rejected'"
              size="sm"
              variant="secondary"
              icon="close"
              @click="reject(comment)"
            >
              Rechazar
            </BaseButton>
            <BaseButton
              size="sm"
              variant="ghost"
              icon="trash"
              aria-label="Eliminar"
              @click="remove(comment)"
            />
          </div>
        </div>
      </BaseCard>
    </div>

    <BasePagination v-model="page" :meta="meta" />
  </div>
</template>

<style scoped>
.tabs {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-6);
}
.tab {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  height: 38px;
  padding: 0 var(--space-4);
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-pill);
  background: var(--surface);
  font-size: var(--text-sm);
  cursor: pointer;
}
.tab--on {
  background: var(--leaf-700);
  border-color: var(--leaf-700);
  color: #fff;
}
.tab__count {
  min-width: 22px;
  padding: 0 6px;
  border-radius: var(--radius-pill);
  background: rgba(0, 0, 0, 0.08);
  font-size: var(--text-xs);
}
.comment {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.comment__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
}
.comment__head :deep(.badge) {
  margin-left: auto;
}
.comment p {
  overflow-wrap: anywhere;
}
.comment__actions {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-2);
}
</style>
