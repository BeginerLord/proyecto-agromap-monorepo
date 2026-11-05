import type { IStaticMapProvider, MapPoint } from './static-map.interface.js'

export interface MapboxStaticMapConfig {
  accessToken: string
  /** Estilo en formato "usuario/estilo", p. ej. "mapbox/outdoors-v12". */
  style: string
  width?: number
  height?: number
  zoom?: number
  markerColor?: string
}

/**
 * Mapbox Static Images API.
 * https://docs.mapbox.com/api/maps/static-images/
 * Formato: /styles/v1/{usuario}/{estilo}/static/{marcador}/{lon},{lat},{zoom}/{ancho}x{alto}@2x
 */
export class MapboxStaticMapAdapter implements IStaticMapProvider {
  readonly key = 'mapbox'

  constructor(private readonly config: MapboxStaticMapConfig) {}

  get style(): string {
    return this.config.style
  }

  isConfigured(): boolean {
    return Boolean(this.config.accessToken)
  }

  async render({ lng, lat }: MapPoint): Promise<Buffer> {
    if (!this.isConfigured()) throw new Error('Falta MAPBOX_ACCESS_TOKEN')
    const { style, width = 640, height = 360, zoom = 15, markerColor = '066c20' } = this.config
    const lon = lng.toFixed(6)
    const la = lat.toFixed(6)
    const url =
      `https://api.mapbox.com/styles/v1/${style}/static/pin-l+${markerColor}(${lon},${la})/` +
      `${lon},${la},${zoom}/${width}x${height}@2x?access_token=${encodeURIComponent(this.config.accessToken)}`

    const response = await fetch(url, { signal: AbortSignal.timeout(10_000) })
    if (!response.ok) throw new Error(`Mapbox Static Images respondió ${response.status}`)
    return Buffer.from(await response.arrayBuffer())
  }
}
