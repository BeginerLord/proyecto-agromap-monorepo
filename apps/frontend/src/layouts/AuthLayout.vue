<script setup lang="ts">
import logoFull from '@/assets/logo-full.png'
import { ROUTE_NAMES } from '@/constants'
</script>

<template>
  <div class="auth">
    <section class="auth__art" aria-hidden="true">
      <!-- Curvas de nivel / surcos: decoración plana, sin degradados -->
      <svg class="auth__contours" viewBox="0 0 600 800" preserveAspectRatio="xMidYMid slice">
        <g fill="none" stroke="currentColor" stroke-width="1.4">
          <path d="M-20 620 C120 560 220 660 360 600 S560 520 640 560" />
          <path d="M-20 660 C120 600 220 700 360 640 S560 560 640 600" />
          <path d="M-20 700 C120 640 220 740 360 680 S560 600 640 640" />
          <path d="M-20 740 C120 680 220 780 360 720 S560 640 640 680" />
          <path d="M-20 200 C100 150 260 240 380 180 S560 120 640 160" />
          <path d="M-20 240 C100 190 260 280 380 220 S560 160 640 200" />
        </g>
      </svg>
      <div class="auth__blob auth__blob--sun" />
      <div class="auth__blob auth__blob--leaf" />
      <div class="auth__copy">
        <p class="eyebrow auth__eyebrow">Seguridad alimentaria estudiantil</p>
        <h2>Del predio periurbano a la mesa de los estudiantes.</h2>
        <p>
          Georreferencia los predios de Martínez y Mateo Gómez, planifica cultivos de ciclo corto y
          anticipa qué alimentos estarán disponibles en cada jornada de apoyo.
        </p>
      </div>
    </section>

    <section class="auth__panel">
      <RouterLink :to="{ name: ROUTE_NAMES.HOME }" class="auth__back">← Volver al sitio</RouterLink>
      <img :src="logoFull" alt="AgroMap" class="auth__logo" width="150" />
      <RouterView />
    </section>
  </div>
</template>

<style scoped>
.auth {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(360px, 520px);
  min-height: 100vh;
}
.auth__art {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
  padding: var(--space-12);
  background: var(--leaf-700);
  color: var(--leaf-100);
}
.auth__contours {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  color: var(--leaf-600);
}
.auth__blob {
  position: absolute;
  border-radius: var(--radius-leaf);
}
.auth__blob--sun {
  top: 12%;
  right: 14%;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: var(--sun-500);
}
.auth__blob--leaf {
  top: 30%;
  left: 12%;
  width: 180px;
  height: 180px;
  border-radius: 0 70% 0 70%;
  background: var(--leaf-800);
}
.auth__copy {
  position: relative;
  max-width: 520px;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.auth__copy h2 {
  color: #fff;
  font-size: clamp(1.8rem, 1.2rem + 2vw, 2.8rem);
}
.auth__eyebrow {
  color: var(--leaf-300);
}
.auth__panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--space-8);
  padding: var(--space-12) clamp(24px, 6vw, 72px);
  background: var(--paper);
}
.auth__back {
  align-self: flex-start;
  font-size: var(--text-sm);
  color: var(--ink-2);
}
.auth__logo {
  height: auto;
}
@media (max-width: 880px) {
  .auth {
    grid-template-columns: 1fr;
  }
  .auth__art {
    display: none;
  }
}
</style>
