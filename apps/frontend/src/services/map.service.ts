import { publicApi } from '@/api'
import type { MapConfig } from '@/models'

let config: Promise<MapConfig> | null = null

/**
 * Configuración de Mapbox entregada por el backend (el token vive solo en apps/backend/.env).
 * Se pide una sola vez por sesión del navegador.
 */
export const mapService = {
  config(): Promise<MapConfig> {
    config ??= publicApi.mapConfig().catch(() => ({ enabled: false, style: '' }))
    return config
  },
}
