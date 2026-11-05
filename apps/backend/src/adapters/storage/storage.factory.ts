import { env } from '../../config/env.js'
import type { IFileStorage } from './file-storage.interface.js'
import { LocalFileStorage } from './local-file.storage.js'
import { S3FileStorage } from './s3-file.storage.js'

const S3_REQUIRED = ['endpoint', 'bucket', 'accessKeyId', 'secretAccessKey'] as const

/** Variables S3 que faltan para poder usar Backblaze B2. */
export function missingS3Settings(): string[] {
  const names = { endpoint: 'S3_ENDPOINT', bucket: 'S3_BUCKET', accessKeyId: 'S3_ACCESS_KEY_ID', secretAccessKey: 'S3_SECRET_ACCESS_KEY' }
  return S3_REQUIRED.filter((field) => !env.storage.s3[field]).map((field) => names[field])
}

/**
 * Elige el adapter según STORAGE_DRIVER. Si se pidió "s3" pero faltan credenciales,
 * se usa el disco local para que la API siga funcionando mientras se configuran.
 */
export function createFileStorage(logger: Pick<Console, 'warn' | 'info'> = console): IFileStorage {
  const local = new LocalFileStorage(env.uploads.dir, env.uploads.publicPath)
  if (env.storage.driver !== 's3') return local

  const missing = missingS3Settings()
  if (missing.length) {
    logger.warn(`[storage] STORAGE_DRIVER=s3 pero faltan ${missing.join(', ')}: se usa almacenamiento local.`)
    return local
  }
  return new S3FileStorage({ ...env.storage.s3, proxyPath: env.uploads.publicPath })
}
