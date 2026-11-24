/**
 * Sube un video (MP4) al bucket de Backblaze B2 con una clave fija: <prefijo>videos/<nombre>.mp4
 * Volver a ejecutarlo con el mismo nombre reemplaza el video.
 *
 * Uso: pnpm --filter @agromap/backend upload-video <ruta-al-mp4> <nombre>
 *      p. ej. upload-video "C:\videos\01.mp4" resultado-final
 */
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { createFileStorage, S3FileStorage } from '../adapters/storage/index.js'

const [file, name] = process.argv.slice(2)
if (!file || !name || !/^[a-z0-9-]+$/.test(name)) {
  console.error('Uso: upload-video <ruta-al-mp4> <nombre-en-minusculas-con-guiones>')
  process.exit(1)
}

const storage = createFileStorage()
if (!(storage instanceof S3FileStorage)) {
  console.error('Activa Backblaze B2 primero (STORAGE_DRIVER=s3 y credenciales S3_* en el .env del backend).')
  process.exit(1)
}

const { size } = await stat(file)
console.log(`Subiendo ${file} (${(size / 1024 / 1024).toFixed(1)} MB)…`)
const stored = await storage.saveAs(`videos/${name}.mp4`, createReadStream(file), size, 'video/mp4')
console.log(`✅ Listo. Clave: ${stored.key}\n   URL pública del sitio: ${stored.url}`)
