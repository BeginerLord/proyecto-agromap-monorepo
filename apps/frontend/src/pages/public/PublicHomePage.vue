<script setup lang="ts">
import { onMounted, ref, shallowRef } from 'vue'
import { useRouter } from 'vue-router'
import PlotMap, { type MapPlot } from '@/components/map/PlotMap.vue'
import CommentList from '@/components/public/CommentList.vue'
import DistributionStory from '@/components/public/DistributionStory.vue'
import PhotoGallery from '@/components/public/PhotoGallery.vue'
import PublicPlotCard from '@/components/public/PublicPlotCard.vue'
import { BaseButton } from '@/components/ui'
import { ROUTE_NAMES } from '@/constants'
import type { PublicComment, PublicDistribution, PublicMedia, PublicOverview, PublicPlot } from '@/models'
import { publicService } from '@/services'
import { formatKg, formatNumber, formatRelativeDays, formatShortDate } from '@/utils/format'

const router = useRouter()
const overview = ref<PublicOverview | null>(null)
const plots = shallowRef<PublicPlot[]>([])
const distributions = shallowRef<PublicDistribution[]>([])
const photos = shallowRef<PublicMedia[]>([])
const comments = shallowRef<PublicComment[]>([])

const openPlot = (plot: MapPlot) => router.push({ name: ROUTE_NAMES.PUBLIC_PLOT, params: { id: plot.id } })

onMounted(async () => {
  const [o, p, d, g, c] = await Promise.allSettled([
    publicService.overview(),
    publicService.plots(),
    publicService.distributions({ limit: 2 }),
    publicService.gallery(8),
    publicService.comments({ limit: 3 }),
  ])
  if (o.status === 'fulfilled') overview.value = o.value
  if (p.status === 'fulfilled') plots.value = p.value
  if (d.status === 'fulfilled') distributions.value = d.value.data
  if (g.status === 'fulfilled') photos.value = g.value
  if (c.status === 'fulfilled') comments.value = c.value.data
})
</script>

<template>
  <div class="home">
    <!-- Hero -->
    <section class="hero">
      <div class="hero__copy">
        <span class="eyebrow">Seguridad alimentaria estudiantil · Cereté</span>
        <h1>Sembramos en los predios periurbanos para que ningún estudiante estudie con hambre.</h1>
        <p class="muted">
          AgroMap-Cereté documenta los cultivos de ciclo corto de Martínez y Mateo Gómez y las jornadas de apoyo
          alimentario del Centro Tutorial Cereté, que se realizan entre semana y los fines de semana.
        </p>
        <div class="row row--wrap">
          <BaseButton icon="map" @click="router.push({ name: ROUTE_NAMES.PUBLIC_PLOTS })">Ver los predios</BaseButton>
          <BaseButton variant="secondary" icon="users" @click="router.push({ name: ROUTE_NAMES.PUBLIC_EXPERIENCES })">
            Comparte tu experiencia
          </BaseButton>
        </div>
      </div>
      <div class="hero__art" aria-hidden="true">
        <div class="hero__sun" />
        <div class="hero__leaf" />
        <svg viewBox="0 0 400 300" class="hero__fields">
          <path d="M0 190 C90 150 170 220 260 180 S380 150 400 160 V300 H0 Z" fill="var(--leaf-300)" />
          <path d="M0 230 C100 200 190 260 290 222 S390 205 400 210 V300 H0 Z" fill="var(--leaf-600)" />
          <path d="M0 262 C120 240 220 290 320 262 S395 252 400 254 V300 H0 Z" fill="var(--leaf-800)" />
        </svg>
      </div>
    </section>

    <!-- Indicadores -->
    <section v-if="overview" class="stats" aria-label="Indicadores del proyecto">
      <div class="stat"><strong class="num">{{ overview.plots }}</strong><span>predios periurbanos</span></div>
      <div class="stat"><strong class="num">{{ overview.activeCrops }}</strong><span>cultivos en marcha</span></div>
      <div class="stat"><strong class="num">{{ formatKg(overview.harvestedKg) }}</strong><span>cosechados</span></div>
      <div class="stat"><strong class="num">{{ formatNumber(overview.beneficiaries) }}</strong><span>apoyos a estudiantes</span></div>
    </section>

    <!-- Mapa + próximas cosechas -->
    <section class="section">
      <header class="section__head">
        <div>
          <span class="eyebrow">Puntos periurbanos</span>
          <h2>Dónde sembramos</h2>
        </div>
        <RouterLink :to="{ name: ROUTE_NAMES.PUBLIC_PLOTS }">Ver todos →</RouterLink>
      </header>
      <div class="map-grid">
        <PlotMap :plots="plots" height="380px" @select="openPlot" />
        <div class="upcoming">
          <h4>Próximas cosechas</h4>
          <ul v-if="overview?.upcomingHarvests.length">
            <li v-for="h in overview.upcomingHarvests" :key="`${h.species}-${h.expectedHarvestAt}`">
              <span class="upcoming__date num">{{ formatShortDate(h.expectedHarvestAt) }}</span>
              <span>
                <strong>{{ h.species }}</strong>
                <small class="faint">{{ h.plot.name }} · {{ formatRelativeDays(h.expectedHarvestAt) }}</small>
              </span>
            </li>
          </ul>
          <p v-else class="faint">Las próximas cosechas aparecerán aquí.</p>
        </div>
      </div>
      <div class="grid plot-grid">
        <PublicPlotCard v-for="plot in plots.slice(0, 3)" :key="plot.id" :plot="plot" />
      </div>
    </section>

    <!-- Evidencias -->
    <section class="section">
      <header class="section__head">
        <div>
          <span class="eyebrow">Evidencias</span>
          <h2>Así van los cultivos</h2>
        </div>
      </header>
      <PhotoGallery :photos="photos" :columns="4" empty-text="Pronto publicaremos fotos de los cultivos" />
    </section>

    <!-- Jornadas -->
    <section class="section">
      <header class="section__head">
        <div>
          <span class="eyebrow">Apoyo alimentario</span>
          <h2>Últimas jornadas</h2>
        </div>
        <RouterLink :to="{ name: ROUTE_NAMES.PUBLIC_DISTRIBUTIONS }">Ver todas →</RouterLink>
      </header>
      <div v-if="distributions.length" class="stack">
        <DistributionStory v-for="d in distributions" :key="d.id" :distribution="d" compact />
      </div>
      <p v-else class="faint">Aún no hay jornadas registradas.</p>
    </section>

    <!-- Experiencias -->
    <section class="section">
      <header class="section__head">
        <div>
          <span class="eyebrow">Voces de la comunidad</span>
          <h2>Experiencias</h2>
        </div>
        <RouterLink :to="{ name: ROUTE_NAMES.PUBLIC_EXPERIENCES }">Contar la mía →</RouterLink>
      </header>
      <CommentList :comments="comments" />
    </section>
  </div>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: var(--space-12);
}
.hero {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
  gap: var(--space-8);
  align-items: center;
  padding: var(--space-8) 0;
}
.hero__copy {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}
.hero__copy h1 {
  font-size: clamp(2rem, 1.3rem + 2.6vw, 3.2rem);
  line-height: 1.1;
}
.hero__copy p {
  font-size: var(--text-lg);
  max-width: 560px;
}
.hero__art {
  position: relative;
  aspect-ratio: 4 / 3;
  border-radius: var(--radius-leaf);
  background: var(--leaf-100);
  overflow: hidden;
}
.hero__sun {
  position: absolute;
  top: 14%;
  right: 16%;
  width: 22%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: var(--sun-500);
}
.hero__leaf {
  position: absolute;
  top: 12%;
  left: 14%;
  width: 26%;
  aspect-ratio: 1;
  border-radius: 0 70% 0 70%;
  background: var(--leaf-700);
}
.hero__fields {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  background: var(--surface);
  overflow: hidden;
}
.stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--space-6);
}
.stat + .stat {
  border-left: 1px solid var(--line);
}
.stat strong {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  color: var(--leaf-700);
  line-height: 1.1;
}
.stat span {
  color: var(--ink-2);
  font-size: var(--text-sm);
}
.section {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}
.section__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: var(--space-4);
}
.section__head a {
  font-weight: 600;
  font-size: var(--text-sm);
}
.map-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
  gap: var(--space-5);
}
.upcoming {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-5);
  border-radius: var(--radius-leaf);
  background: var(--surface);
  border: 1px solid var(--line);
}
.upcoming ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.upcoming li {
  display: flex;
  gap: var(--space-3);
  align-items: center;
}
.upcoming li > span:last-child {
  display: flex;
  flex-direction: column;
}
.upcoming__date {
  min-width: 64px;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  background: var(--sun-100);
  color: var(--sun-700);
  font-size: var(--text-sm);
  font-weight: 700;
  text-align: center;
}
.plot-grid {
  grid-template-columns: repeat(auto-fill, minmax(min(300px, 100%), 1fr));
}
@media (max-width: 900px) {
  .hero,
  .map-grid {
    grid-template-columns: 1fr;
  }
  .hero {
    padding: var(--space-4) 0;
  }
  .hero__art {
    aspect-ratio: 16 / 7;
  }
  .stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .stat:nth-child(3) {
    border-left: 0;
  }
  .stat:nth-child(n + 3) {
    border-top: 1px solid var(--line);
  }
}
</style>
