import type { FastifyBaseLogger } from 'fastify'
import type { IStaticMapProvider } from '../adapters/maps/index.js'
import type { IFileStorage } from '../adapters/storage/index.js'
import { env } from '../config/env.js'
import type { Plot, PlotMapSnapshot } from '../interfaces/entities/index.js'
import type { IPlotRepository } from '../interfaces/repositories/index.js'
import type { IMapSnapshotService } from '../interfaces/services/index.js'
import { toWebp } from '../utils/index.js'

/** Diferencia máxima (grados, ~1 m) para considerar que el punto no cambió. */
const SAME_POINT = 0.00001

/**
 * Optimiza el consumo de Mapbox: al registrar (o mover) un predio se pide UNA imagen estática
 * y se guarda en el almacenamiento propio. Fichas, tarjetas y el sitio público reutilizan esa
 * imagen sin volver a llamar a Mapbox.
 */
export class MapSnapshotService implements IMapSnapshotService {
  constructor(
    private readonly provider: IStaticMapProvider,
    private readonly storage: IFileStorage,
    private readonly plots: IPlotRepository,
    private readonly logger?: FastifyBaseLogger,
  ) {}

  isEnabled(): boolean {
    return env.mapbox.snapshots && this.provider.isConfigured()
  }

  /** Genera el snapshot solo si falta o si la ubicación cambió. Nunca hace fallar el registro del predio. */
  async ensure(plot: Plot): Promise<Plot> {
    if (!this.isEnabled() || this.isCurrent(plot)) return plot

    const [lng, lat] = plot.location.point.coordinates
    try {
      // PNG de Mapbox → WebP (pesa ~70 % menos y se ve igual: calidad alta por el texto del mapa)
      const image = await toWebp(await this.provider.render({ lng, lat }), { maxDimension: 1280, quality: 90 })
      const stored = await this.storage.save({ content: image.buffer, extension: image.extension, contentType: image.mimeType })
      const snapshot: PlotMapSnapshot = {
        url: stored.url,
        storageKey: stored.key,
        lng,
        lat,
        style: this.provider.style,
        generatedAt: new Date(),
      }
      const updated = await this.plots.updateById(plot.id, { mapSnapshot: snapshot })
      if (plot.mapSnapshot) await this.storage.remove(plot.mapSnapshot.storageKey)
      return updated ?? plot
    } catch (error) {
      ;(this.logger ?? console).warn({ err: error, plotId: plot.id }, 'No se pudo generar el mapa estático del predio')
      return plot
    }
  }

  async remove(plot: Plot): Promise<void> {
    if (plot.mapSnapshot) await this.storage.remove(plot.mapSnapshot.storageKey)
  }

  private isCurrent(plot: Plot): boolean {
    const snap = plot.mapSnapshot
    if (!snap) return false
    const [lng, lat] = plot.location.point.coordinates
    return Math.abs(snap.lng - lng) < SAME_POINT && Math.abs(snap.lat - lat) < SAME_POINT && snap.style === this.provider.style
  }
}
