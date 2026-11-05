<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { BaseButton, BaseInput, BaseSelect, BaseTextarea } from '@/components/ui'
import { useAsyncAction } from '@/composables/useAsyncAction'
import { COMMENT_AUTHOR_ROLES, toOptions } from '@/constants'
import type { CommentAuthorRole } from '@/models'
import { publicService } from '@/services'

/** Formulario público "Comparte tu experiencia". Los comentarios se publican tras moderación. */
const props = defineProps<{ distributions?: { id: string; title: string }[]; plotId?: string }>()

const empty = () => ({
  authorName: '',
  authorRole: 'student' as CommentAuthorRole,
  message: '',
  rating: 0,
  distributionId: '',
  website: '', // honeypot
})
const form = reactive(empty())
const sent = ref<string | null>(null)
const { pending, fieldErrors, run } = useAsyncAction()

const distributionOptions = computed(() => (props.distributions ?? []).map((d) => ({ value: d.id, label: d.title })))
const remaining = computed(() => 800 - form.message.length)

async function submit() {
  const result = await run(() =>
    publicService.submitComment({
      authorName: form.authorName,
      authorRole: form.authorRole,
      message: form.message,
      rating: form.rating || undefined,
      distributionId: form.distributionId || undefined,
      plotId: props.plotId,
      website: form.website,
    }),
  )
  if (result) {
    sent.value = result.message
    Object.assign(form, empty())
  }
}
</script>

<template>
  <div class="comment-form">
    <div v-if="sent" class="comment-form__thanks" role="status">
      <strong>¡Gracias!</strong>
      <p>{{ sent }}</p>
      <BaseButton variant="secondary" size="sm" @click="sent = null">Escribir otra experiencia</BaseButton>
    </div>

    <form v-else class="stack" @submit.prevent="submit">
      <div class="grid grid--2">
        <BaseInput v-model="form.authorName" label="Tu nombre" autocomplete="name" required :error="fieldErrors.authorName" />
        <BaseSelect v-model="form.authorRole" label="Participas como" :options="toOptions(COMMENT_AUTHOR_ROLES)" />
      </div>
      <BaseSelect
        v-if="distributionOptions.length"
        v-model="form.distributionId"
        label="Jornada (opcional)"
        :options="distributionOptions"
        placeholder="General"
      />
      <BaseTextarea
        v-model="form.message"
        label="Tu experiencia"
        placeholder="¿Cómo te ayudó la jornada? ¿Qué aprendiste en el predio?"
        :hint="`${remaining} caracteres disponibles · mínimo 10`"
        required
        :error="fieldErrors.message"
      />

      <fieldset class="rating">
        <legend>¿Cómo calificarías la experiencia? (opcional)</legend>
        <button
          v-for="n in 5"
          :key="n"
          type="button"
          class="rating__dot"
          :class="{ 'rating__dot--on': n <= form.rating }"
          :aria-label="`${n} de 5`"
          :aria-pressed="n === form.rating"
          @click="form.rating = form.rating === n ? 0 : n"
        />
      </fieldset>

      <!-- Campo trampa para bots: oculto a personas y lectores de pantalla -->
      <input v-model="form.website" class="honeypot" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" />

      <div class="row row--between row--wrap">
        <span class="faint">Tu comentario se publicará después de que el equipo lo revise.</span>
        <BaseButton type="submit" :loading="pending" icon="check">Enviar experiencia</BaseButton>
      </div>
    </form>
  </div>
</template>

<style scoped>
.comment-form {
  padding: var(--space-6);
  border-radius: var(--radius-leaf);
  background: var(--surface);
  border: 1px solid var(--line);
}
.comment-form__thanks {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-3);
}
.comment-form__thanks strong {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  color: var(--leaf-700);
}
.rating {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  border: 0;
}
.rating legend {
  margin-bottom: var(--space-2);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--ink-2);
}
.rating__dot {
  width: 26px;
  height: 26px;
  border: 2px solid var(--line-strong);
  border-radius: 50%;
  background: var(--surface);
  cursor: pointer;
}
.rating__dot--on {
  background: var(--sun-500);
  border-color: var(--sun-500);
}
.honeypot {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  opacity: 0;
}
</style>
