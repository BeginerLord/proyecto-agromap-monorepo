export interface MapPoint {
  lng: number
  lat: number
}

/**
 * Proveedor de imágenes estáticas de mapa (patrón Adapter).
 * Hoy se usa Mapbox Static Images API; cambiar de proveedor solo requiere otro adapter.
 */
export interface IStaticMapProvider {
  readonly key: string
  /** Estilo con el que se generan las imágenes (se guarda junto al snapshot). */
  readonly style: string
  isConfigured(): boolean
  /** Devuelve la imagen PNG del punto con un marcador. Una llamada = una petición facturable. */
  render(point: MapPoint): Promise<Buffer>
}
