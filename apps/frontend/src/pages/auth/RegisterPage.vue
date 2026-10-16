<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { BaseButton, BaseInput } from '@/components/ui'
import { useAsyncAction } from '@/composables/useAsyncAction'
import { ROUTE_NAMES } from '@/constants'
import { useAuthStore } from '@/stores/auth.store'

const auth = useAuthStore()
const router = useRouter()
const form = reactive({ name: '', email: '', password: '' })
const { pending, fieldErrors, run } = useAsyncAction()

async function submit() {
  const ok = await run(async () => {
    await auth.register(form)
    return true
  }, 'Cuenta creada')
  if (ok) await router.push({ name: ROUTE_NAMES.DASHBOARD })
}
</script>

<template>
  <div class="auth-form">
    <header class="stack" style="gap: 6px">
      <h1>Crea tu cuenta</h1>
      <p class="muted">Las cuentas nuevas inician con rol de estudiante; un administrador puede ampliar permisos.</p>
    </header>

    <form class="stack" @submit.prevent="submit">
      <BaseInput v-model="form.name" label="Nombre completo" autocomplete="name" required :error="fieldErrors.name" />
      <BaseInput v-model="form.email" label="Correo" type="email" autocomplete="email" required :error="fieldErrors.email" />
      <BaseInput
        v-model="form.password"
        label="Contraseña"
        type="password"
        autocomplete="new-password"
        hint="Mínimo 8 caracteres"
        required
        :error="fieldErrors.password"
      />
      <BaseButton type="submit" block :loading="pending">Crear cuenta</BaseButton>
    </form>

    <p class="muted" style="font-size: var(--text-sm)">
      ¿Ya tienes cuenta?
      <RouterLink :to="{ name: ROUTE_NAMES.LOGIN }">Inicia sesión</RouterLink>
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
</style>
