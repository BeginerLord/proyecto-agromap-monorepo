<script setup lang="ts">
import { computed } from 'vue'
import logoMark from '@/assets/logo-mark.png'
import UdecSignature from '@/components/public/UdecSignature.vue'
import BaseIcon, { type IconName } from '@/components/ui/BaseIcon.vue'
import { APP_NAME, APP_SUBTITLE, ROLE_GROUPS, ROLES, ROUTE_NAMES, type RouteName } from '@/constants'
import { useAuthStore } from '@/stores/auth.store'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ navigate: [] }>()

interface NavItem {
  to: RouteName
  label: string
  icon: IconName
  adminOnly?: boolean
  managersOnly?: boolean
}

const sections: { title: string; items: NavItem[] }[] = [
  {
    title: 'General',
    items: [
      { to: ROUTE_NAMES.DASHBOARD, label: 'Resumen', icon: 'dashboard' },
      { to: ROUTE_NAMES.PLOTS, label: 'Predios', icon: 'map' },
      { to: ROUTE_NAMES.CROPS, label: 'Cultivos', icon: 'sprout' },
      { to: ROUTE_NAMES.FIELD_LOGS, label: 'Bitácora', icon: 'notebook' },
    ],
  },
  {
    title: 'Alimentos',
    items: [
      { to: ROUTE_NAMES.HARVESTS, label: 'Cosechas', icon: 'basket' },
      { to: ROUTE_NAMES.DISTRIBUTIONS, label: 'Jornadas de apoyo', icon: 'calendar' },
    ],
  },
  {
    title: 'Sistema',
    items: [
      { to: ROUTE_NAMES.SENSORS, label: 'Sensores', icon: 'sensor' },
      { to: ROUTE_NAMES.COMMENTS, label: 'Experiencias', icon: 'notebook', managersOnly: true },
      { to: ROUTE_NAMES.USERS, label: 'Usuarios', icon: 'users', adminOnly: true },
    ],
  },
]

const auth = useAuthStore()
const visibleSections = computed(() =>
  sections.map((section) => ({
    ...section,
    items: section.items.filter(
      (item) =>
        (!item.adminOnly || auth.hasRole([ROLES.ADMIN])) && (!item.managersOnly || auth.hasRole(ROLE_GROUPS.MANAGERS)),
    ),
  })),
)
</script>

<template>
  <aside class="sidebar" :class="{ 'sidebar--open': open }">
    <RouterLink :to="{ name: ROUTE_NAMES.DASHBOARD }" class="brand" @click="emit('navigate')">
      <img :src="logoMark" alt="" width="40" height="40" />
      <span class="brand__text">
        <strong>{{ APP_NAME }}</strong>
        <small>{{ APP_SUBTITLE }}</small>
      </span>
    </RouterLink>

    <nav class="nav" aria-label="Principal">
      <div v-for="section in visibleSections" :key="section.title" class="nav__section">
        <span class="eyebrow nav__title">{{ section.title }}</span>
        <RouterLink
          v-for="item in section.items"
          :key="item.to"
          :to="{ name: item.to }"
          class="nav__link"
          :active-class="item.to === ROUTE_NAMES.DASHBOARD ? '' : 'nav__link--active'"
          exact-active-class="nav__link--active"
          @click="emit('navigate')"
        >
          <BaseIcon :name="item.icon" />
          <span>{{ item.label }}</span>
        </RouterLink>
      </div>
    </nav>

    <div class="sidebar__foot">
      <RouterLink :to="{ name: ROUTE_NAMES.HOME }" class="nav__link" @click="emit('navigate')">
        <BaseIcon name="arrow" />
        <span>Ver sitio público</span>
      </RouterLink>
      <UdecSignature :size="44" />
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 50;
  width: var(--sidebar-width);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  padding: var(--space-6) var(--space-4);
  background: var(--sand);
  border-right: 1px solid var(--line);
  transition: transform 200ms ease;
}
.brand {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: 0 var(--space-2);
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
  color: var(--ink-3);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.nav {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  overflow-y: auto;
}
.nav__section {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.nav__title {
  padding: 0 var(--space-3) var(--space-2);
}
.nav__link {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  height: 40px;
  padding: 0 var(--space-3);
  border-radius: var(--radius-leaf-sm);
  color: var(--ink-2);
  font-size: var(--text-sm);
  font-weight: 500;
  text-decoration: none !important;
  transition:
    background var(--transition),
    color var(--transition);
}
.nav__link:hover {
  background: var(--paper);
  color: var(--ink);
}
.nav__link--active {
  background: var(--leaf-700);
  color: #fff;
}
.nav__link--active:hover {
  background: var(--leaf-800);
  color: #fff;
}
.sidebar__foot {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--line);
}
.sidebar__foot :deep(.udec) {
  padding: 0 var(--space-2);
}
@media (max-width: 960px) {
  .sidebar {
    transform: translateX(-100%);
  }
  .sidebar--open {
    transform: translateX(0);
    box-shadow: var(--shadow-md);
  }
}
</style>
