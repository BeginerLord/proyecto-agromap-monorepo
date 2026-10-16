<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import { ROUTE_NAMES } from '@/constants'
import { useAuthStore } from '@/stores/auth.store'

const menuOpen = ref(false)
const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

// Si la sesión expira (refresh fallido), volver al login conservando la ruta actual
watch(
  () => auth.isAuthenticated,
  (authenticated) => {
    if (!authenticated) void router.push({ name: ROUTE_NAMES.LOGIN, query: { redirect: route.fullPath } })
  },
)
</script>

<template>
  <div class="shell">
    <AppSidebar :open="menuOpen" @navigate="menuOpen = false" />
    <div v-if="menuOpen" class="shell__scrim" @click="menuOpen = false" />
    <div class="shell__main">
      <AppTopbar @toggle-menu="menuOpen = !menuOpen" />
      <main class="shell__content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.shell__main {
  margin-left: var(--sidebar-width);
  min-height: 100vh;
}
.shell__content {
  max-width: 1240px;
  margin: 0 auto;
  padding: var(--space-8);
}
.shell__scrim {
  position: fixed;
  inset: 0;
  z-index: 45;
  background: rgba(30, 43, 33, 0.3);
}
@media (max-width: 960px) {
  .shell__main {
    margin-left: 0;
  }
  .shell__content {
    padding: var(--space-6) var(--space-4);
  }
}
</style>
