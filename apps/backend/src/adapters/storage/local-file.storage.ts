import { randomUUID } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { mkdir, rm, stat, writeFile } from 'node:fs/promises'
import { basename, extname, join } from 'node:path'
import type { FileToStore, IFileStorage, StoredFile, StoredObject } from './file-storage.interface.js'

const CONTENT_TYPES: Record<string, string> = {
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
}

/** Guarda archivos en una carpeta local (desarrollo o respaldo cuando no hay credenciales de S3). */
export class LocalFileStorage implements IFileStorage {
  readonly driver = 'local'

  constructor(
    private readonly directory: string,
    private readonly publicPath: string,
  ) {}

  async save({ content, extension }: FileToStore): Promise<StoredFile> {
    await mkdir(this.directory, { recursive: true })
    const key = `${randomUUID()}.${extension}`
    await writeFile(join(this.directory, key), content)
    return { key, url: this.urlFor(key) }
  }

  async remove(key: string): Promise<void> {
    await rm(this.pathOf(key), { force: true })
  }

  urlFor(key: string): string {
    return `${this.publicPath}${basename(key)}`
  }

  async get(key: string): Promise<StoredObject | null> {
    const path = this.pathOf(key)
    const info = await stat(path).catch(() => null)
    if (!info?.isFile()) return null
    return {
      body: createReadStream(path),
      contentLength: info.size,
      contentType: CONTENT_TYPES[extname(path).toLowerCase()] ?? 'application/octet-stream',
    }
  }

  /** basename evita que una clave manipulada salga de la carpeta de uploads. */
  private pathOf(key: string) {
    return join(this.directory, basename(key))
  }
}
