<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import DistributionFormModal from '@/components/distributions/DistributionFormModal.vue'
import MediaManager from '@/components/media/MediaManager.vue'
import { BaseButton, BaseCard, BaseIcon, BaseModal, BasePagination, EmptyState, PageHeader } from '@/components/ui'
import { usePaginatedList } from '@/composables/usePaginatedList'
import { ROLE_GROUPS } from '@/constants'
import type { Distribution, DistributionQuery } from '@/models'
import { distributionService } from '@/services'
import { useAuthStore } from '@/stores/auth.store'

const auth = useAuthStore()
const canManage = computed(() => auth.hasRole(ROLE_GROUPS.MANAGERS))
const canField = computed(() => auth.hasRole(ROLE_GROUPS.FIELD_TEAM))
const photosFor = ref<Distribution | null>(null)
const photosOpen = computed({
  get: () => photosFor.value !== null,
  set: (value: boolean) => {
    if (!value) photosFor.value = null
  },
})
const formOpen = ref(false)

const { items, meta, loading, page, load } = usePaginatedList<Distribution, DistributionQuery>(
  (query) => distributionService.list(query),
  {},
)

const yearOf = (date: string) => new Date(date).getFullYear()

onMounted(load)
</script>

<template>
  <div>
    <PageHeader
      eyebrow="Apoyo alimentario"
      title="Jornadas de apoyo"
      description="Entregas de alimentos a los estudiantes. Las jornadas se realizan entre semana y los fines de semana."
    >
      <template #actions>
        <BaseButton v-if="canManage" icon="plus" @click="formOpen = true">Registrar entrega</BaseButton>
      </template>
    </PageHeader>

    <EmptyState
      v-if="!loading && !items.length"
      icon="calendar"
      title="Sin entregas registradas"
      description="Cuando haya cosechas disponibles, registra la entrega de la jornada."
    />

    <div class="grid grid--cards">
      <BaseCard v-for="dist in items" :key="dist.id" leaf>
        <div class="dist">
          <div class="dist__date">
            <span class="eyebrow">{{ yearOf(dist.date) }}</span>
            <h3>{{ dist.title }}</h3>
          </div>
          <div class="dist__kpis">
            <span><BaseIcon name="users" :size="16" /> <strong class="num">{{ dist.beneficiaries }}</strong> estudiantes</span>
          </div>
          <p v-if="dist.notes" class="faint">{{ dist.notes }}</p>
          <div>
            <BaseButton size="sm" variant="secondary" icon="leaf" @click="photosFor = dist">Fotos de la jornada</BaseButton>
          </div>
        </div>
      </BaseCard>
    </div>

    <BasePagination v-model="page" :meta="meta" />

    <DistributionFormModal v-model:open="formOpen" @saved="load" />
    <BaseModal v-model:open="photosOpen" :title="photosFor?.title ?? 'Fotos'" description="Evidencias de la jornada para el sitio público." :width="760">
      <MediaManager v-if="photosFor" :owner="{ distributionId: photosFor.id }" :can-edit="canField" />
    </BaseModal>
  </div>
</template>

<style scoped>
.dist {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.dist__kpis {
  display: flex;
  gap: var(--space-6);
  font-size: var(--text-sm);
  color: var(--ink-2);
}
.dist__kpis span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.dist__kpis strong {
  color: var(--ink);
}
</style>
