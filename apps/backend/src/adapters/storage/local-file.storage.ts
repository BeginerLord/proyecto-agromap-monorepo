import { randomUUID } from 'node:crypto'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'
import type { IFileStorage, StoredFile } from './file-storage.interface.js'

/** Guarda archivos en una carpeta local servida estáticamente por Fastify. */
export class LocalFileStorage implements IFileStorage {
  constructor(
    private readonly directory: string,
    private readonly publicPath: string,
  ) {}

  async save(content: Buffer, extension: string): Promise<StoredFile> {
    await mkdir(this.directory, { recursive: true })
    const key = `${randomUUID()}.${extension}`
    await writeFile(join(this.directory, key), content)
    return { key, url: `${this.publicPath}${key}` }
  }

  async remove(key: string): Promise<void> {
    // basename evita que una clave manipulada salga de la carpeta de uploads
    await rm(join(this.directory, basename(key)), { force: true })
  }
}
