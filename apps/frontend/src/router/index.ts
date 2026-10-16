import { createRouter, createWebHistory } from 'vue-router'
import { registerGuards } from './guards'
import { routes } from './routes'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: (_to, _from, saved) => saved ?? { top: 0 },
})

registerGuards(router)
