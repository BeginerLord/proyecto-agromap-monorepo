import type { MultipartFields, MultipartValue } from '@fastify/multipart'
import type { FastifyReply, FastifyRequest } from 'fastify'
import type { IdParamDto, MediaQueryDto, UpdateMediaDto, UploadMediaFields } from '../dtos/index.js'
import { BadRequestException } from '../exceptions/index.js'
import type { IMediaService } from '../interfaces/services/index.js'
import { currentUser } from '../middlewares/index.js'

/** Lee un campo de texto del multipart (ignora archivos y valores repetidos). */
function textField(fields: MultipartFields, name: string): string | undefined {
  const entry = fields[name]
  const value = Array.isArray(entry) ? entry[0] : entry
  if (!value || value.type !== 'field') return undefined
  const text = String((value as MultipartValue).value ?? '').trim()
  return text || undefined
}

export class MediaController {
  constructor(private readonly media: IMediaService) {}

  list = (request: FastifyRequest<{ Querystring: MediaQueryDto }>) => this.media.list(request.query)

  /** multipart/form-data: primero los campos de texto y al final el archivo `file`. */
  upload = async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.isMultipart()) throw new BadRequestException('Envía la foto como multipart/form-data')
    const part = await request.file()
    if (!part) throw new BadRequestException('No se recibió ninguna imagen (campo "file")')

    const buffer = await part.toBuffer()
    const fields: UploadMediaFields = {
      caption: textField(part.fields, 'caption'),
      plotId: textField(part.fields, 'plotId'),
      cropId: textField(part.fields, 'cropId'),
      distributionId: textField(part.fields, 'distributionId'),
      takenAt: textField(part.fields, 'takenAt'),
      isPublic: textField(part.fields, 'isPublic') !== 'false',
    }

    const media = await this.media.upload({ buffer, originalName: part.filename }, fields, currentUser(request))
    return reply.status(201).send(media)
  }

  update = (request: FastifyRequest<{ Params: IdParamDto; Body: UpdateMediaDto }>) =>
    this.media.update(request.params.id, request.body, currentUser(request))

  remove = async (request: FastifyRequest<{ Params: IdParamDto }>, reply: FastifyReply) => {
    await this.media.remove(request.params.id, currentUser(request))
    return reply.status(204).send()
  }
}
