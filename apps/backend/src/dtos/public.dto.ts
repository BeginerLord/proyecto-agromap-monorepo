import Type, { type Static } from 'typebox'
import { SUN_EXPOSURE, WATER_ACCESS } from '../constants/domain.js'
import { CropStatusDto } from './crop.dto.js'
import { DateTime, ObjectId, Paginated, PaginationQueryDto, PlotRefDto, StringEnum } from './common.dto.js'
import { GeoPointDto } from './plot.dto.js'

/*
 * DTOs del sitio público. Exponen solo información apta para la comunidad:
 * nunca datos del propietario, teléfonos, usuarios ni campos de moderación.
 */

export const PublicMediaDto = Type.Object({
  id: Type.String(),
  url: Type.String(),
  caption: Type.Optional(Type.String()),
  plot: Type.Optional(PlotRefDto),
  crop: Type.Optional(Type.Object({ species: Type.String() })),
  takenAt: Type.Optional(DateTime),
  createdAt: DateTime,
})

const PublicCropDto = Type.Object({
  id: Type.String(),
  species: Type.String(),
  variety: Type.Optional(Type.String()),
  status: CropStatusDto,
  plantedAt: Type.Optional(DateTime),
  expectedHarvestAt: Type.Optional(DateTime),
})

export const PublicPlotDto = Type.Object({
  id: Type.String(),
  name: Type.String(),
  location: Type.Object({ municipality: Type.String(), district: Type.String(), point: GeoPointDto }),
  areaM2: Type.Optional(Type.Number()),
  characterization: Type.Object({
    soilType: Type.Optional(Type.String()),
    waterAccess: Type.Optional(StringEnum(WATER_ACCESS)),
    sunExposure: Type.Optional(StringEnum(SUN_EXPOSURE)),
  }),
  coverUrl: Type.Optional(Type.String()),
  photoCount: Type.Integer(),
  crops: Type.Array(PublicCropDto),
})
export type PublicMediaDto = Static<typeof PublicMediaDto>
export type PublicPlotDto = Static<typeof PublicPlotDto>
export const PublicPlotListDto = Type.Object({ data: Type.Array(PublicPlotDto) })

export const PublicPlotDetailDto = Type.Object({
  ...PublicPlotDto.properties,
  gallery: Type.Array(PublicMediaDto),
})

export const PublicDistributionDto = Type.Object({
  id: Type.String(),
  date: DateTime,
  title: Type.String(),
  items: Type.Array(Type.Object({ species: Type.String(), quantityKg: Type.Number() })),
  totalKg: Type.Number(),
  beneficiaries: Type.Integer(),
  notes: Type.Optional(Type.String()),
  photos: Type.Array(PublicMediaDto),
  commentCount: Type.Integer(),
})
export type PublicPlotDetailDto = Static<typeof PublicPlotDetailDto>
export type PublicDistributionDto = Static<typeof PublicDistributionDto>
export const PublicDistributionListDto = Paginated(PublicDistributionDto)

export const PublicOverviewDto = Type.Object({
  plots: Type.Integer(),
  activeCrops: Type.Integer(),
  harvestedKg: Type.Number(),
  distributedKg: Type.Number(),
  beneficiaries: Type.Integer(),
  distributions: Type.Integer(),
  upcomingHarvests: Type.Array(
    Type.Object({
      species: Type.String(),
      variety: Type.Optional(Type.String()),
      plot: PlotRefDto,
      expectedHarvestAt: DateTime,
    }),
  ),
})
export type PublicOverviewDto = Static<typeof PublicOverviewDto>

export const PublicGalleryQueryDto = Type.Object({
  limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 48, default: 12 })),
  plotId: Type.Optional(ObjectId),
})
export type PublicGalleryQueryDto = Static<typeof PublicGalleryQueryDto>

export const PublicCommentQueryDto = Type.Object({
  ...PaginationQueryDto.properties,
  plotId: Type.Optional(ObjectId),
  distributionId: Type.Optional(ObjectId),
})
export type PublicCommentQueryDto = Static<typeof PublicCommentQueryDto>
