<script setup lang="ts">
import { reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { BaseButton, BaseInput } from '@/components/ui'
import { useAsyncAction } from '@/composables/useAsyncAction'
import { ROUTE_NAMES } from '@/constants'
import { useAuthStore } from '@/stores/auth.store'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const form = reactive({ email: '', password: '' })
const { pending, error, run } = useAsyncAction()

async function submit() {
  const ok = await run(async () => {
    await auth.login(form)
    return true
  })
  if (ok) {
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : undefined
    await router.push(redirect ?? { name: ROUTE_NAMES.DASHBOARD })
  }
}
</script>

<template>
  <div class="auth-form">
    <header class="stack" style="gap: 6px">
      <h1>Bienvenido de nuevo</h1>
      <p class="muted">Ingresa para gestionar los predios y cultivos.</p>
    </header>

    <form class="stack" novalidate @submit.prevent="submit">
      <BaseInput v-model="form.email" label="Correo" type="email" autocomplete="email" required />
      <BaseInput
        v-model="form.password"
        label="Contraseña"
        type="password"
        autocomplete="current-password"
        required
      />
      <p v-if="error" class="auth-form__error" role="alert">{{ error }}</p>
      <BaseButton type="submit" block :loading="pending">Iniciar sesión</BaseButton>
    </form>

    <p class="muted auth-form__alt">
      ¿No tienes cuenta?
      <RouterLink :to="{ name: ROUTE_NAMES.REGISTER }">Regístrate</RouterLink>
    </p>
  </div>
</template>

<style scoped>
.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  max-width: 380px;
}
.auth-form__error {
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-sm);
  background: var(--clay-100);
  color: var(--clay-700);
  font-size: var(--text-sm);
}
.auth-form__alt {
  font-size: var(--text-sm);
}
</style>
