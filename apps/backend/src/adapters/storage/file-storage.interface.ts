export interface StoredFile {
  /** Nombre/clave con el que quedó guardado (se usa para eliminarlo). */
  key: string
  /** URL pública desde la que el frontend puede mostrarlo. */
  url: string
}

/**
 * Contrato de almacenamiento de archivos (patrón Adapter).
 * Hoy se usa disco local; para producción se puede crear un adapter de S3, Cloudinary, etc.
 * sin tocar servicios ni controladores.
 */
export interface IFileStorage {
  save(content: Buffer, extension: string): Promise<StoredFile>
  remove(key: string): Promise<void>
}
