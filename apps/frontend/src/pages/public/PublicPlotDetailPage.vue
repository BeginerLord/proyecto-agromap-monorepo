<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue'
import CropProgress from '@/components/crops/CropProgress.vue'
import PlotMap from '@/components/map/PlotMap.vue'
import CommentList from '@/components/public/CommentList.vue'
import PhotoGallery from '@/components/public/PhotoGallery.vue'
import { BaseBadge, EmptyState, PageHeader } from '@/components/ui'
import { CROP_STATUS, ROUTE_NAMES, SUN_EXPOSURE, WATER_ACCESS } from '@/constants'
import type { Crop, PublicComment, PublicPlotDetail } from '@/models'
import { publicService } from '@/services'
import { formatArea, formatDate } from '@/utils/format'

const props = defineProps<{ id: string }>()
const plot = ref<PublicPlotDetail | null>(null)
const comments = shallowRef<PublicComment[]>([])
const notFound = ref(false)

onMounted(async () => {
  try {
    const [detail, list] = await Promise.all([
      publicService.plot(props.id),
      publicService.comments({ plotId: props.id, limit: 5 }),
    ])
    plot.value = detail
    comments.value = list.data
  } catch {
    notFound.value = true
  }
})

const facts = computed(() => {
  if (!plot.value) return []
  const c = plot.value.characterization
  return [
    { label: 'Corregimiento', value: plot.value.location.district },
    { label: 'Área', value: formatArea(plot.value.areaM2) },
    { label: 'Tipo de suelo', value: c.soilType ?? '—' },
    { label: 'Acceso a agua', value: c.waterAccess ? WATER_ACCESS[c.waterAccess] : '—' },
    { label: 'Exposición solar', value: c.sunExposure ? SUN_EXPOSURE[c.sunExposure] : '—' },
  ]
})

/** CropProgress espera un Crop; los campos faltantes no se usan para calcular el avance. */
const asCrop = (crop: PublicPlotDetail['crops'][number]) => crop as unknown as Crop
</script>

<template>
  <EmptyState v-if="notFound" icon="map" title="Este predio no está disponible">
    <RouterLink :to="{ name: ROUTE_NAMES.PUBLIC_PLOTS }">Ver todos los predios</RouterLink>
  </EmptyState>

  <div v-else-if="plot" class="detail">
    <RouterLink :to="{ name: ROUTE_NAMES.PUBLIC_PLOTS }" class="faint">← Puntos periurbanos</RouterLink>
    <PageHeader :eyebrow="`${plot.location.municipality} · ${plot.location.district}`" :title="plot.name" />

    <div class="detail__top">
      <PlotMap :plots="[plot]" :selected-id="plot.id" height="320px" />
      <dl class="facts">
        <div v-for="fact in facts" :key="fact.label">
          <dt class="faint">{{ fact.label }}</dt>
          <dd>{{ fact.value }}</dd>
        </div>
      </dl>
    </div>

    <section class="block">
      <h2>Cultivos</h2>
      <EmptyState v-if="!plot.crops.length" title="Preparando la próxima siembra" />
      <div v-else class="grid crops">
        <article v-for="crop in plot.crops" :key="crop.id" class="crop">
          <div class="row row--between">
            <h4>{{ crop.species }}<small v-if="crop.variety" class="faint"> · {{ crop.variety }}</small></h4>
            <BaseBadge :tone="CROP_STATUS[crop.status].tone">{{ CROP_STATUS[crop.status].label }}</BaseBadge>
          </div>
          <span class="faint">Siembra {{ formatDate(crop.plantedAt) }}</span>
          <CropProgress :crop="asCrop(crop)" />
        </article>
      </div>
    </section>

    <section class="block">
      <h2>Evidencias del predio</h2>
      <PhotoGallery :photos="plot.gallery" :columns="4" empty-text="Este predio aún no tiene fotos publicadas" />
    </section>

    <section v-if="comments.length" class="block">
      <h2>Lo que dice la comunidad</h2>
      <CommentList :comments="comments" />
    </section>
  </div>
</template>

<style scoped>
.detail {
  display: flex;
  flex-direction: column;
}
.detail__top {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
  gap: var(--space-6);
}
.facts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-content: start;
  gap: var(--space-4);
  margin: 0;
  padding: var(--space-6);
  border-radius: var(--radius-leaf);
  background: var(--surface);
  border: 1px solid var(--line);
}
.facts dd {
  margin: 2px 0 0;
  font-weight: 500;
}
.block {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin-top: var(--space-10);
}
.crops {
  grid-template-columns: repeat(auto-fill, minmax(min(280px, 100%), 1fr));
}
.crop {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-5);
  border-radius: var(--radius-lg);
  background: var(--surface);
  border: 1px solid var(--line);
}
@media (max-width: 900px) {
  .detail__top {
    grid-template-columns: 1fr;
  }
}
</style>
