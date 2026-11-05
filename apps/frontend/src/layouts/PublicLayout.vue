<script setup lang="ts">
import PublicFooter from '@/components/public/PublicFooter.vue'
import PublicHeader from '@/components/public/PublicHeader.vue'
</script>

<template>
  <div class="public">
    <PublicHeader />
    <main class="public__main">
      <RouterView />
    </main>
    <PublicFooter />
  </div>
</template>

<style scoped>
.public {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.public__main {
  flex: 1;
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-6) 0;
}
@media (max-width: 760px) {
  .public__main {
    padding: var(--space-6) var(--space-4) 0;
  }
}
</style>
