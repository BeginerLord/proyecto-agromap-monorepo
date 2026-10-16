import type {
  PaginationQueryDto,
  PublicCommentQueryDto,
  PublicDistributionDto,
  PublicGalleryQueryDto,
  PublicMediaDto,
  PublicOverviewDto,
  PublicPlotDetailDto,
  PublicPlotDto,
} from '../dtos/index.js'
import { NotFoundException } from '../exceptions/index.js'
import type { PaginatedResult } from '../interfaces/common/pagination.interface.js'
import type { Comment, Crop, Media, Plot } from '../interfaces/entities/index.js'
import type {
  ICommentRepository,
  ICropRepository,
  IDistributionRepository,
  IHarvestRepository,
  IMediaRepository,
  IPlotRepository,
} from '../interfaces/repositories/index.js'
import type { IPublicService } from '../interfaces/services/index.js'
import { addDays, resolvePagination, toPaginated } from '../utils/index.js'

/** Lo que se muestra de un cultivo en el sitio público (ciclo activo y recientes). */
const VISIBLE_CROP_STATUS = ['planned', 'planted', 'growing', 'harvesting', 'finished']

/**
 * Arma las vistas del sitio público a partir de los repositorios, depurando datos
 * sensibles (propietarios, teléfonos, usuarios, moderación).
 */
export class PublicService implements IPublicService {
  constructor(
    private readonly plotsRepo: IPlotRepository,
    private readonly cropsRepo: ICropRepository,
    private readonly harvests: IHarvestRepository,
    private readonly distributionsRepo: IDistributionRepository,
    private readonly media: IMediaRepository,
    private readonly commentsRepo: ICommentRepository,
  ) {}

  async overview(): Promise<PublicOverviewDto> {
    const now = new Date()
    const [plots, byStatus, harvest, distributions, upcoming] = await Promise.all([
      this.plotsRepo.count({ status: 'active' }),
      this.cropsRepo.countByStatus(),
      this.harvests.totals(),
      this.distributionsRepo.totals(),
      this.cropsRepo.findUpcomingHarvests(now, addDays(now, 60), 6),
    ])
    return {
      plots,
      activeCrops: (byStatus.planted ?? 0) + (byStatus.growing ?? 0) + (byStatus.harvesting ?? 0),
      harvestedKg: harvest.harvestedKg,
      distributedKg: distributions.distributedKg,
      beneficiaries: distributions.beneficiaries,
      distributions: distributions.count,
      upcomingHarvests: upcoming
        .filter((crop) => crop.expectedHarvestAt)
        .map((crop) => ({
          species: crop.species,
          variety: crop.variety,
          plot: crop.plot,
          expectedHarvestAt: crop.expectedHarvestAt!,
        })),
    }
  }

  async plots(): Promise<{ data: PublicPlotDto[] }> {
    const { items } = await this.plotsRepo.findMany({ filter: { status: 'active' }, page: 1, limit: 100, sort: { name: 1 } })
    const ids = items.map((plot) => plot.id)
    const [covers, crops] = await Promise.all([this.media.coversByPlot(ids), this.cropsByPlot(ids)])
    return { data: items.map((plot) => this.toPublicPlot(plot, crops.get(plot.id) ?? [], covers.get(plot.id))) }
  }

  async plot(id: string): Promise<PublicPlotDetailDto> {
    const plot = await this.plotsRepo.findById(id)
    if (!plot || plot.status !== 'active') throw new NotFoundException('Predio', id)
    const [covers, crops, gallery] = await Promise.all([
      this.media.coversByPlot([id]),
      this.cropsByPlot([id]),
      this.media.findPublic({ plot: id }, 48),
    ])
    return {
      ...this.toPublicPlot(plot, crops.get(id) ?? [], covers.get(id)),
      gallery: gallery.map(toPublicMedia),
    }
  }

  async distributions(query: PaginationQueryDto): Promise<PaginatedResult<PublicDistributionDto>> {
    const pagination = resolvePagination(query)
    const result = await this.distributionsRepo.findMany({ ...pagination, sort: { date: -1 } })
    const ids = result.items.map((d) => d.id)
    const [photos, commentCounts] = await Promise.all([
      this.media.publicByDistribution(ids),
      this.commentsRepo.approvedCountByDistribution(ids),
    ])
    const items = result.items.map((d) => ({
      id: d.id,
      date: d.date,
      title: d.title,
      items: d.items.map(({ species, quantityKg }) => ({ species, quantityKg })),
      totalKg: d.totalKg,
      beneficiaries: d.beneficiaries,
      notes: d.notes,
      photos: (photos.get(d.id) ?? []).map(toPublicMedia),
      commentCount: commentCounts.get(d.id) ?? 0,
    }))
    return toPaginated({ items, total: result.total }, pagination)
  }

  async gallery(query: PublicGalleryQueryDto): Promise<PublicMediaDto[]> {
    const filter = query.plotId ? { plot: query.plotId } : {}
    return (await this.media.findPublic(filter, query.limit ?? 12)).map(toPublicMedia)
  }

  async comments(query: PublicCommentQueryDto): Promise<PaginatedResult<Comment>> {
    const pagination = resolvePagination(query)
    const filter = {
      status: 'approved',
      ...(query.plotId && { plot: query.plotId }),
      ...(query.distributionId && { distribution: query.distributionId }),
    }
    return toPaginated(await this.commentsRepo.findMany({ ...pagination, filter }), pagination)
  }

  private async cropsByPlot(plotIds: string[]): Promise<Map<string, Crop[]>> {
    const { items } = await this.cropsRepo.findMany({
      filter: { plot: { $in: plotIds }, status: { $in: VISIBLE_CROP_STATUS } },
      page: 1,
      limit: 500,
      sort: { plantedAt: -1 },
    })
    const grouped = new Map<string, Crop[]>()
    for (const crop of items) grouped.set(crop.plot.id, [...(grouped.get(crop.plot.id) ?? []), crop])
    return grouped
  }

  private toPublicPlot(plot: Plot, crops: Crop[], cover?: { url: string; count: number }): PublicPlotDto {
    const { soilType, waterAccess, sunExposure } = plot.characterization
    return {
      id: plot.id,
      name: plot.name,
      location: {
        municipality: plot.location.municipality,
        district: plot.location.district,
        point: plot.location.point,
      },
      areaM2: plot.areaM2,
      characterization: { soilType, waterAccess, sunExposure },
      coverUrl: cover?.url,
      photoCount: cover?.count ?? 0,
      crops: crops.map((crop) => ({
        id: crop.id,
        species: crop.species,
        variety: crop.variety,
        status: crop.status,
        plantedAt: crop.plantedAt,
        expectedHarvestAt: crop.expectedHarvestAt,
      })),
    }
  }
}

function toPublicMedia(media: Media): PublicMediaDto {
  return {
    id: media.id,
    url: media.url,
    caption: media.caption,
    plot: media.plot,
    crop: media.crop ? { species: media.crop.species } : undefined,
    takenAt: media.takenAt,
    createdAt: media.createdAt,
  }
}
