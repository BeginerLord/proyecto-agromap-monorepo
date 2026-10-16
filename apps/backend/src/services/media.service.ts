import type { IFileStorage } from '../adapters/storage/index.js'
import { ROLE_GROUPS } from '../constants/roles.js'
import type { MediaQueryDto, UpdateMediaDto, UploadMediaFields } from '../dtos/index.js'
import { BadRequestException, ForbiddenException, NotFoundException } from '../exceptions/index.js'
import type { AuthUser } from '../interfaces/common/auth.interface.js'
import type { PaginatedResult } from '../interfaces/common/pagination.interface.js'
import type { Media } from '../interfaces/entities/index.js'
import type {
  ICropRepository,
  IDistributionRepository,
  IMediaRepository,
  IPlotRepository,
} from '../interfaces/repositories/index.js'
import type { IMediaService, UploadedFile } from '../interfaces/services/index.js'
import { compact, detectImage, resolvePagination, toDate, toPaginated } from '../utils/index.js'

const OBJECT_ID = /^[a-fA-F0-9]{24}$/

export class MediaService implements IMediaService {
  constructor(
    private readonly media: IMediaRepository,
    private readonly storage: IFileStorage,
    private readonly plots: IPlotRepository,
    private readonly crops: ICropRepository,
    private readonly distributions: IDistributionRepository,
  ) {}

  async list(query: MediaQueryDto): Promise<PaginatedResult<Media>> {
    const pagination = resolvePagination(query)
    const filter = {
      ...(query.plotId && { plot: query.plotId }),
      ...(query.cropId && { crop: query.cropId }),
      ...(query.distributionId && { distribution: query.distributionId }),
    }
    return toPaginated(await this.media.findMany({ ...pagination, filter }), pagination)
  }

  async upload(file: UploadedFile, fields: UploadMediaFields, actor: AuthUser): Promise<Media> {
    const image = detectImage(file.buffer)
    if (!image) throw new BadRequestException('El archivo debe ser una imagen JPG, PNG o WEBP')

    const relations = await this.resolveRelations(fields)
    if (!relations.plot && !relations.crop && !relations.distribution) {
      throw new BadRequestException('Asocia la foto a un predio, un cultivo o una jornada')
    }

    const stored = await this.storage.save(file.buffer, image.extension)
    try {
      return await this.media.create({
        url: stored.url,
        storageKey: stored.key,
        mimeType: image.mimeType,
        size: file.buffer.length,
        caption: fields.caption?.trim().slice(0, 200) || undefined,
        takenAt: toDate(fields.takenAt),
        isPublic: fields.isPublic ?? true,
        uploadedBy: actor.id,
        ...relations,
      })
    } catch (error) {
      await this.storage.remove(stored.key) // no dejar archivos huérfanos
      throw error
    }
  }

  async update(id: string, dto: UpdateMediaDto, actor: AuthUser): Promise<Media> {
    await this.assertCanModify(id, actor)
    const updated = await this.media.updateById(id, compact(dto))
    if (!updated) throw new NotFoundException('Evidencia', id)
    return updated
  }

  async remove(id: string, actor: AuthUser): Promise<void> {
    const media = await this.assertCanModify(id, actor)
    await this.media.deleteById(id)
    await this.storage.remove(media.storageKey)
  }

  /** Valida los ids recibidos en el formulario y completa el predio a partir del cultivo. */
  private async resolveRelations(fields: UploadMediaFields) {
    for (const key of ['plotId', 'cropId', 'distributionId'] as const) {
      const value = fields[key]
      if (value && !OBJECT_ID.test(value)) throw new BadRequestException(`${key} no es un id válido`)
    }
    let plot = fields.plotId
    if (fields.cropId) {
      const crop = await this.crops.findById(fields.cropId)
      if (!crop) throw new NotFoundException('Cultivo', fields.cropId)
      plot ??= crop.plot.id
    }
    if (plot && !(await this.plots.exists({ _id: plot }))) throw new NotFoundException('Predio', plot)
    if (fields.distributionId && !(await this.distributions.exists({ _id: fields.distributionId }))) {
      throw new NotFoundException('Jornada', fields.distributionId)
    }
    return { plot, crop: fields.cropId, distribution: fields.distributionId }
  }

  /** El autor de la foto o un administrador/agrónomo pueden modificarla. */
  private async assertCanModify(id: string, actor: AuthUser): Promise<Media> {
    const media = await this.media.findById(id)
    if (!media) throw new NotFoundException('Evidencia', id)
    const isManager = (ROLE_GROUPS.MANAGERS as readonly string[]).includes(actor.role)
    if (media.uploadedBy.id !== actor.id && !isManager) {
      throw new ForbiddenException('Solo quien subió la foto o un administrador puede modificarla')
    }
    return media
  }
}
