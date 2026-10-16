<script setup lang="ts">
import { computed } from 'vue'
import ProgressBar from '@/components/ui/ProgressBar.vue'
import { CROP_STATUS } from '@/constants/labels'
import type { Crop } from '@/models'
import { cropService } from '@/services'
import { formatRelativeDays } from '@/utils/format'

const props = defineProps<{ crop: Crop }>()

const progress = computed(() => cropService.progress(props.crop))
const tone = computed(() => CROP_STATUS[props.crop.status].tone)
</script>

<template>
  <div class="crop-progress">
    <template v-if="progress !== null">
      <ProgressBar :value="progress" :tone="tone" :label="`Avance del ciclo de ${crop.species}`" />
      <div class="row row--between faint">
        <span class="num">{{ progress }}% del ciclo</span>
        <span>Cosecha {{ formatRelativeDays(crop.expectedHarvestAt) }}</span>
      </div>
    </template>
    <span v-else class="faint">Sin fecha de siembra registrada</span>
  </div>
</template>

<style scoped>
.crop-progress {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
</style>
