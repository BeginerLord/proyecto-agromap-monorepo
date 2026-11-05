<script setup lang="ts">
import { ref } from 'vue'
import logoMark from '@/assets/logo-mark.png'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import { APP_NAME, APP_SUBTITLE, ROUTE_NAMES } from '@/constants'
import { useAuthStore } from '@/stores/auth.store'

const auth = useAuthStore()
const open = ref(false)

const links = [
  { to: ROUTE_NAMES.HOME, label: 'Inicio' },
  { to: ROUTE_NAMES.PUBLIC_PLOTS, label: 'Puntos periurbanos' },
  { to: ROUTE_NAMES.PUBLIC_DISTRIBUTIONS, label: 'Jornadas de apoyo' },
  { to: ROUTE_NAMES.PUBLIC_EXPERIENCES, label: 'Experiencias' },
]
</script>

<template>
  <header class="header">
    <div class="header__inner">
      <RouterLink :to="{ name: ROUTE_NAMES.HOME }" class="brand" @click="open = false">
        <img :src="logoMark" alt="" width="38" height="38" />
        <span class="brand__text">
          <strong>{{ APP_NAME }}</strong>
          <small>{{ APP_SUBTITLE }}</small>
        </span>
      </RouterLink>

      <nav class="nav" :class="{ 'nav--open': open }" aria-label="Sitio público">
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="{ name: link.to }"
          class="nav__link"
          :active-class="link.to === ROUTE_NAMES.HOME ? '' : 'nav__link--active'"
          exact-active-class="nav__link--active"
          @click="open = false"
        >
          {{ link.label }}
        </RouterLink>
        <RouterLink
          :to="{ name: auth.isAuthenticated ? ROUTE_NAMES.DASHBOARD : ROUTE_NAMES.LOGIN }"
          class="nav__cta"
          @click="open = false"
        >
          {{ auth.isAuthenticated ? 'Ir al panel' : 'Ingresar' }}
        </RouterLink>
      </nav>

      <button class="header__menu" type="button" :aria-expanded="open" aria-label="Menú" @click="open = !open">
        <BaseIcon :name="open ? 'close' : 'menu'" />
      </button>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 40;
  background: var(--paper);
  border-bottom: 1px solid var(--line);
}
.header__inner {
  max-width: 1180px;
  margin: 0 auto;
  height: 68px;
  padding: 0 var(--space-6);
  display: flex;
  align-items: center;
  gap: var(--space-6);
}
.brand {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  color: var(--ink);
  text-decoration: none !important;
}
.brand__text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}
.brand__text strong {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  color: var(--leaf-700);
}
.brand__text small {
  font-size: var(--text-xs);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-3);
}
.nav {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: var(--space-1);
}
.nav__link {
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-pill);
  color: var(--ink-2);
  font-size: var(--text-sm);
  font-weight: 500;
  text-decoration: none !important;
}
.nav__link:hover {
  background: var(--sand);
  color: var(--ink);
}
.nav__link--active {
  color: var(--leaf-800);
  background: var(--leaf-100);
}
.nav__cta {
  margin-left: var(--space-3);
  padding: var(--space-2) var(--space-5);
  border-radius: var(--radius-pill);
  background: var(--leaf-700);
  color: #fff;
  font-size: var(--text-sm);
  font-weight: 600;
  text-decoration: none !important;
}
.nav__cta:hover {
  background: var(--leaf-800);
}
.header__menu {
  display: none;
  margin-left: auto;
  border: 0;
  background: none;
  color: var(--ink-2);
  cursor: pointer;
}
@media (max-width: 860px) {
  .header__menu {
    display: grid;
  }
  .nav {
    display: none;
    position: absolute;
    top: 68px;
    left: 0;
    right: 0;
    flex-direction: column;
    align-items: stretch;
    padding: var(--space-4);
    background: var(--paper);
    border-bottom: 1px solid var(--line);
  }
  .nav--open {
    display: flex;
  }
  .nav__cta {
    margin: var(--space-2) 0 0;
    text-align: center;
  }
}
</style>
