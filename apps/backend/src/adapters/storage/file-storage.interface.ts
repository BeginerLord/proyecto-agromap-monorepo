import type { Readable } from 'node:stream'

export interface StoredFile {
  /** Clave con la que quedó guardado (se usa para eliminarlo). */
  key: string
  /** URL pública desde la que el frontend puede mostrarlo. */
  url: string
}

export interface FileToStore {
  content: Buffer
  /** Extensión sin punto (p. ej. "webp"). */
  extension: string
  /** Tipo MIME real del contenido (p. ej. "image/webp"). */
  contentType: string
}

export interface StoredObject {
  body: Readable
  contentType?: string
  contentLength?: number
  etag?: string
  /** Presente cuando se atendió un rango (HTTP 206), p. ej. "bytes 0-1023/4096". */
  contentRange?: string
}

/**
 * Contrato de almacenamiento de archivos (patrón Adapter).
 * Implementaciones: disco local (desarrollo) y S3 compatible (Backblaze B2).
 * Los servicios y controladores no saben dónde quedan los archivos.
 */
export interface IFileStorage {
  /** Identificador del adapter ("local" | "s3"). */
  readonly driver: string
  save(file: FileToStore): Promise<StoredFile>
  remove(key: string): Promise<void>
  /** URL pública de una clave ya guardada. */
  urlFor(key: string): string
  /** Lee un objeto para servirlo a través de la API (null si no existe). */
  get(key: string, range?: string): Promise<StoredObject | null>
}
