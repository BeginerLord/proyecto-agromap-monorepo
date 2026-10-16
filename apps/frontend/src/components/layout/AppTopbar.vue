<script setup lang="ts">
import { useRouter } from 'vue-router'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import { ROLE_LABELS, ROUTE_NAMES } from '@/constants'
import { useAuthStore } from '@/stores/auth.store'
import { initials } from '@/utils/format'

const emit = defineEmits<{ toggleMenu: [] }>()
const auth = useAuthStore()
const router = useRouter()

async function logout() {
  await auth.logout()
  await router.push({ name: ROUTE_NAMES.LOGIN })
}
</script>

<template>
  <header class="topbar">
    <button class="topbar__menu" type="button" aria-label="Abrir menú" @click="emit('toggleMenu')">
      <BaseIcon name="menu" />
    </button>

    <div class="topbar__spacer" />

    <div v-if="auth.user" class="user">
      <span class="user__avatar" aria-hidden="true">{{ initials(auth.user.name) }}</span>
      <span class="user__meta">
        <strong>{{ auth.user.name }}</strong>
        <small>{{ ROLE_LABELS[auth.user.role] }}</small>
      </span>
      <button class="user__logout" type="button" title="Cerrar sesión" aria-label="Cerrar sesión" @click="logout">
        <BaseIcon name="logout" />
      </button>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  position: sticky;
  top: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  gap: var(--space-4);
  height: var(--topbar-height);
  padding: 0 var(--space-8);
  background: var(--paper);
  border-bottom: 1px solid var(--line);
}
.topbar__spacer {
  flex: 1;
}
.topbar__menu {
  display: none;
  border: 0;
  background: none;
  cursor: pointer;
  color: var(--ink-2);
}
.user {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
.user__avatar {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: var(--radius-leaf-sm);
  background: var(--leaf-100);
  color: var(--leaf-800);
  font-weight: 700;
  font-size: var(--text-sm);
}
.user__meta {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}
.user__meta strong {
  font-size: var(--text-sm);
}
.user__meta small {
  font-size: var(--text-xs);
  color: var(--ink-3);
}
.user__logout {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border: 1px solid var(--line);
  border-radius: 50%;
  background: var(--surface);
  color: var(--ink-2);
  cursor: pointer;
}
.user__logout:hover {
  color: var(--clay-700);
  border-color: var(--clay-100);
  background: var(--clay-100);
}
@media (max-width: 960px) {
  .topbar {
    padding: 0 var(--space-4);
  }
  .topbar__menu {
    display: grid;
  }
}
@media (max-width: 560px) {
  .user__meta {
    display: none;
  }
}
</style>
