import sharp from 'sharp'

export interface DetectedImage {
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp'
  extension: 'jpg' | 'png' | 'webp'
}

/**
 * Detecta el tipo real de imagen por sus "magic bytes".
 * No se confía en el mimetype ni en la extensión enviados por el cliente.
 */
export function detectImage(buffer: Buffer): DetectedImage | null {
  if (buffer.length < 12) return null
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { mimeType: 'image/jpeg', extension: 'jpg' }
  }
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { mimeType: 'image/png', extension: 'png' }
  }
  if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
    return { mimeType: 'image/webp', extension: 'webp' }
  }
  return null
}

export interface WebpOptions {
  /** Lado mayor máximo; no se amplían imágenes más pequeñas. */
  maxDimension: number
  /** Calidad 1-100. */
  quality: number
}

export interface OptimizedImage {
  buffer: Buffer
  width: number
  height: number
  mimeType: 'image/webp'
  extension: 'webp'
}

/**
 * Convierte cualquier JPG/PNG/WEBP a WebP optimizado:
 * - respeta la orientación EXIF del celular (rotate) y luego descarta los metadatos
 *   (incluida la ubicación GPS de la foto),
 * - reduce solo si supera maxDimension,
 * - smartSubsample conserva mejor los bordes de color (hojas, frutos, texto del mapa).
 */
export async function toWebp(input: Buffer, { maxDimension, quality }: WebpOptions): Promise<OptimizedImage> {
  const { data, info } = await sharp(input, { failOn: 'error' })
    .rotate()
    .resize({ width: maxDimension, height: maxDimension, fit: 'inside', withoutEnlargement: true })
    .webp({ quality, effort: 5, smartSubsample: true })
    .toBuffer({ resolveWithObject: true })
  return { buffer: data, width: info.width, height: info.height, mimeType: 'image/webp', extension: 'webp' }
}
