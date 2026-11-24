/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_MAP_CENTER_LAT?: string
  readonly VITE_MAP_CENTER_LNG?: string
  readonly VITE_MAP_ZOOM?: string
  readonly VITE_AUTH_BYPASS?: string
  readonly VITE_SENSORS_ENABLED?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
