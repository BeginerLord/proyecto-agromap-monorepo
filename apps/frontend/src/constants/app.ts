export const APP_NAME = 'AgroMap'
export const APP_SUBTITLE = 'Cereté'

export const API_URL = import.meta.env.VITE_API_URL || '/api/v1'

export const MAP_DEFAULTS = {
  center: [
    Number(import.meta.env.VITE_MAP_CENTER_LAT ?? 8.8853),
    Number(import.meta.env.VITE_MAP_CENTER_LNG ?? -75.7917),
  ] as [number, number],
  zoom: Number(import.meta.env.VITE_MAP_ZOOM ?? 12),
  tiles: import.meta.env.VITE_MAP_TILES_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}

export const PAGE_SIZE = 12
