<script setup lang="ts">
import { onMounted } from 'vue'
import { BaseBadge, BaseCard, BasePagination, PageHeader, SearchInput } from '@/components/ui'
import { useAsyncAction } from '@/composables/useAsyncAction'
import { usePaginatedList } from '@/composables/usePaginatedList'
import { ROLE_LABELS, type Role } from '@/constants'
import type { User, UserQuery } from '@/models'
import { userService } from '@/services'
import { useAuthStore } from '@/stores/auth.store'
import { formatDateTime, initials } from '@/utils/format'

const auth = useAuthStore()
const { run } = useAsyncAction()
const { items, meta, filters, page, load } = usePaginatedList<User, UserQuery>((q) => userService.list(q), { search: '' })

async function update(user: User, payload: { role?: Role; isActive?: boolean }) {
  await run(() => userService.update(user.id, payload), 'Usuario actualizado')
  await load()
}

onMounted(load)
</script>

<template>
  <div>
    <PageHeader eyebrow="Administración" title="Usuarios" description="Gestiona roles y acceso del equipo del proyecto." />

    <BaseCard padding="none">
      <div style="padding: var(--space-4)">
        <SearchInput v-model="filters.search" placeholder="Buscar por nombre o correo" />
      </div>
      <div style="overflow-x: auto">
        <table class="table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Último acceso</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in items" :key="user.id">
              <td>
                <div class="who">
                  <span class="who__avatar">{{ initials(user.name) }}</span>
                  <div>
                    <strong>{{ user.name }}</strong>
                    <div class="faint">{{ user.email }}</div>
                  </div>
                </div>
              </td>
              <td>
                <select
                  class="inline-select"
                  :value="user.role"
                  :disabled="user.id === auth.user?.id"
                  aria-label="Rol"
                  @change="update(user, { role: ($event.target as HTMLSelectElement).value as Role })"
                >
                  <option v-for="(label, value) in ROLE_LABELS" :key="value" :value="value">{{ label }}</option>
                </select>
              </td>
              <td>
                <button
                  type="button"
                  class="status-btn"
                  :disabled="user.id === auth.user?.id"
                  @click="update(user, { isActive: !user.isActive })"
                >
                  <BaseBadge :tone="user.isActive ? 'leaf' : 'clay'">{{ user.isActive ? 'Activo' : 'Inactivo' }}</BaseBadge>
                </button>
              </td>
              <td class="faint">{{ formatDateTime(user.lastLoginAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div style="padding: 0 var(--space-4) var(--space-4)"><BasePagination v-model="page" :meta="meta" /></div>
    </BaseCard>
  </div>
</template>

<style scoped>
.who {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
.who__avatar {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-leaf-sm);
  background: var(--leaf-100);
  color: var(--leaf-800);
  font-size: var(--text-xs);
  font-weight: 700;
}
.inline-select {
  height: 34px;
  padding: 0 var(--space-3);
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-pill);
  background: var(--surface);
  font-size: var(--text-sm);
}
.status-btn {
  border: 0;
  background: none;
  padding: 0;
  cursor: pointer;
}
.status-btn:disabled {
  cursor: not-allowed;
}
</style>
