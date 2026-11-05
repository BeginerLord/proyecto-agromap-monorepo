/**
 * Pasa las imágenes que siguen en disco local (carpeta uploads) al almacenamiento activo
 * (Backblaze B2), convirtiéndolas a WebP, y actualiza sus URLs en la base de datos.
 * Se puede ejecutar varias veces: solo procesa lo que aún está en disco.
 *
 * Uso: pnpm --filter @agromap/backend storage-migrate
 *      (en Docker: docker compose exec backend node dist/scripts/storage-migrate.js)
 */
import { readFile, rm } from 'node:fs/promises'
import { basename, join } from 'node:path'
import mongoose from 'mongoose'
import { createFileStorage, missingS3Settings } from '../adapters/storage/index.js'
import { env } from '../config/env.js'
import { MediaModel } from '../models/media.model.js'
import { PlotModel } from '../models/plot.model.js'
import { toWebp, type WebpOptions } from '../utils/index.js'

const storage = createFileStorage()

/** Lee el archivo local de una clave; null si ya no está en disco (ya migrado). */
async function readLocal(key: string): Promise<Buffer | null> {
  return readFile(join(env.uploads.dir, basename(key))).catch(() => null)
}

async function upload(content: Buffer, options: WebpOptions) {
  const image = await toWebp(content, options)
  const stored = await storage.save({ content: image.buffer, extension: image.extension, contentType: image.mimeType })
  return { ...stored, size: image.buffer.length, mimeType: image.mimeType }
}

async function run() {
  if (storage.driver !== 's3') {
    const missing = missingS3Settings()
    console.log(
      `ℹ️  Activa Backblaze B2 primero: STORAGE_DRIVER=s3${missing.length ? ` y completa ${missing.join(', ')}` : ''} en el .env del backend.`,
    )
    return
  }
  await mongoose.connect(env.mongoUri)
  const photoOptions = { maxDimension: env.images.maxDimension, quality: env.images.webpQuality }
  const summary = { photos: 0, maps: 0, failed: 0 }

  for (const media of await MediaModel.find({}, { storageKey: 1 }).lean()) {
    const content = await readLocal(media.storageKey)
    if (!content) continue
    try {
      const stored = await upload(content, photoOptions)
      await MediaModel.updateOne(
        { _id: media._id },
        { url: stored.url, storageKey: stored.key, mimeType: stored.mimeType, size: stored.size },
      )
      await rm(join(env.uploads.dir, basename(media.storageKey)), { force: true })
      summary.photos++
    } catch (error) {
      summary.failed++
      console.warn(`⚠️  Foto ${media._id}: ${(error as Error).message}`)
    }
  }

  for (const plot of await PlotModel.find({ mapSnapshot: { $exists: true } }, { mapSnapshot: 1 }).lean()) {
    const key = plot.mapSnapshot?.storageKey
    const content = key ? await readLocal(key) : null
    if (!key || !content) continue
    try {
      const stored = await upload(content, { maxDimension: 1280, quality: 90 })
      await PlotModel.updateOne(
        { _id: plot._id },
        { 'mapSnapshot.url': stored.url, 'mapSnapshot.storageKey': stored.key },
      )
      await rm(join(env.uploads.dir, basename(key)), { force: true })
      summary.maps++
    } catch (error) {
      summary.failed++
      console.warn(`⚠️  Mapa del predio ${plot._id}: ${(error as Error).message}`)
    }
  }

  console.log(`✅ ${summary.photos} fotos y ${summary.maps} mapas movidos a B2 (WebP) · ${summary.failed} fallaron`)
}

run()
  .catch((error) => {
    console.error('❌', error)
    process.exitCode = 1
  })
  .finally(() => mongoose.disconnect())
