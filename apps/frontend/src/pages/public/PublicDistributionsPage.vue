<script setup lang="ts">
import { onMounted } from 'vue'
import DistributionStory from '@/components/public/DistributionStory.vue'
import { BasePagination, EmptyState, PageHeader } from '@/components/ui'
import { usePaginatedList } from '@/composables/usePaginatedList'
import type { PaginationQuery, PublicDistribution } from '@/models'
import { publicService } from '@/services'

const { items, meta, loading, page, load } = usePaginatedList<PublicDistribution, PaginationQuery>(
  (query) => publicService.distributions(query),
  {},
)

onMounted(load)
</script>

<template>
  <div>
    <PageHeader
      eyebrow="Apoyo alimentario"
      title="Jornadas de apoyo"
      description="Cada jornada lleva a los estudiantes alimentos cosechados en los predios periurbanos. Se realizan entre semana y los fines de semana."
    />

    <EmptyState v-if="!loading && !items.length" icon="calendar" title="Aún no hay jornadas registradas" />

    <div class="stack" style="gap: var(--space-6)">
      <DistributionStory v-for="d in items" :key="d.id" :distribution="d" />
    </div>

    <BasePagination v-model="page" :meta="meta" />
  </div>
</template>
