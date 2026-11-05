import { randomUUID } from 'node:crypto'
import type { Readable } from 'node:stream'
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import type { FileToStore, IFileStorage, StoredFile, StoredObject } from './file-storage.interface.js'

export interface S3StorageConfig {
  /** p. ej. https://s3.us-east-005.backblazeb2.com */
  endpoint: string
  /** p. ej. us-east-005 (el segmento de región del endpoint de B2). */
  region: string
  bucket: string
  accessKeyId: string
  secretAccessKey: string
  /** Prefijo opcional de las claves (carpeta dentro del bucket), p. ej. "evidencias/". */
  keyPrefix: string
  forcePathStyle: boolean
  /**
   * URL pública del bucket (solo si el bucket es público), p. ej.
   * https://f005.backblazeb2.com/file/mi-bucket. Vacía = la API sirve las imágenes en /uploads/*.
   */
  publicUrl: string
  /** Ruta de la API que sirve los objetos cuando el bucket es privado. */
  proxyPath: string
}

/** Las claves son UUID: el contenido nunca cambia, así que puede cachearse sin límite. */
export const IMMUTABLE_CACHE = 'public, max-age=31536000, immutable'

/**
 * Almacenamiento S3 compatible. Pensado para Backblaze B2 (capa gratuita), pero sirve con
 * cualquier proveedor S3 (AWS, Cloudflare R2, MinIO) cambiando solo las variables de entorno.
 */
export class S3FileStorage implements IFileStorage {
  readonly driver = 's3'
  private readonly client: S3Client

  constructor(private readonly config: S3StorageConfig) {
    this.client = new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      forcePathStyle: config.forcePathStyle,
      credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey },
      // B2 no admite todas las sumas de verificación que el SDK envía por defecto
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
    })
  }

  get bucket() {
    return this.config.bucket
  }

  async save({ content, extension, contentType }: FileToStore): Promise<StoredFile> {
    const key = `${this.config.keyPrefix}${randomUUID()}.${extension}`
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
        Body: content,
        ContentType: contentType,
        CacheControl: IMMUTABLE_CACHE,
      }),
    )
    return { key, url: this.urlFor(key) }
  }

  async remove(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.config.bucket, Key: key }))
  }

  urlFor(key: string): string {
    const base = this.config.publicUrl.replace(/\/+$/, '')
    return base ? `${base}/${key}` : `${this.config.proxyPath}${key}`
  }

  async get(key: string): Promise<StoredObject | null> {
    try {
      const object = await this.client.send(new GetObjectCommand({ Bucket: this.config.bucket, Key: key }))
      if (!object.Body) return null
      return {
        body: object.Body as Readable,
        contentType: object.ContentType,
        contentLength: object.ContentLength,
        etag: object.ETag,
      }
    } catch (error) {
      const status = (error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode
      if (status === 404 || (error as Error).name === 'NoSuchKey') return null
      throw error
    }
  }
}
