<script setup lang="ts">
import { ROUTE_NAMES } from '@/constants'
import UdecSignature from './UdecSignature.vue'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="footer__inner">
      <div class="footer__about">
        <UdecSignature :size="64" />
        <p class="faint">
          Proyecto de seguridad alimentaria estudiantil con predios periurbanos en los corregimientos de
          Martínez y Mateo Gómez — Programa de Ingeniería de Software.
        </p>
      </div>

      <nav class="footer__links" aria-label="Enlaces del pie de página">
        <span class="eyebrow">Explorar</span>
        <RouterLink :to="{ name: ROUTE_NAMES.PUBLIC_PLOTS }">Puntos periurbanos</RouterLink>
        <RouterLink :to="{ name: ROUTE_NAMES.PUBLIC_DISTRIBUTIONS }">Jornadas de apoyo</RouterLink>
        <RouterLink :to="{ name: ROUTE_NAMES.PUBLIC_EXPERIENCES }">Comparte tu experiencia</RouterLink>
      </nav>

      <nav class="footer__links" aria-label="Acceso del equipo">
        <span class="eyebrow">Equipo</span>
        <RouterLink :to="{ name: ROUTE_NAMES.LOGIN }">Ingresar al panel</RouterLink>
      </nav>
    </div>
    <div class="footer__bottom">
      <span>© {{ year }} AgroMap-Cereté · Universidad de Cartagena</span>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  margin-top: var(--space-12);
  background: var(--sand);
  border-top: 1px solid var(--line);
}
.footer__inner {
  max-width: 1180px;
  margin: 0 auto;
  padding: var(--space-10) var(--space-6);
  display: grid;
  grid-template-columns: minmax(0, 2fr) repeat(2, minmax(0, 1fr));
  gap: var(--space-8);
}
.footer__about {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  max-width: 440px;
}
.footer__links {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  font-size: var(--text-sm);
}
.footer__links a {
  color: var(--ink-2);
}
.footer__links a:hover {
  color: var(--leaf-700);
}
.footer__bottom {
  border-top: 1px solid var(--line);
  padding: var(--space-4) var(--space-6);
  text-align: center;
  font-size: var(--text-xs);
  color: var(--ink-3);
}
@media (max-width: 760px) {
  .footer__inner {
    grid-template-columns: 1fr;
  }
}
</style>
