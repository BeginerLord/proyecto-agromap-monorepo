import { ref } from 'vue'

export interface GeoFix {
  lat: number
  lng: number
  /** Radio de precisión en metros reportado por el dispositivo. */
  accuracy: number
}

export type GeoStatus = 'idle' | 'locating' | 'located' | 'denied' | 'error' | 'unsupported'

const MESSAGES: Record<number, { status: GeoStatus; message: string }> = {
  1: {
    status: 'denied',
    message: 'Permiso de ubicación denegado. Actívalo en el navegador (ícono del candado) o marca el punto en el mapa.',
  },
  2: { status: 'error', message: 'No se pudo determinar la ubicación. Verifica el GPS o marca el punto en el mapa.' },
  3: { status: 'error', message: 'La ubicación tardó demasiado. Intenta de nuevo o marca el punto en el mapa.' },
}

/**
 * Obtiene la ubicación del dispositivo con la API de Geolocalización del navegador.
 * La primera llamada hace que el navegador pida permiso al usuario.
 * Requiere contexto seguro (https o localhost).
 */
export function useGeolocation() {
  const status = ref<GeoStatus>('idle')
  const message = ref<string | null>(null)
  const fix = ref<GeoFix | null>(null)

  function locate(): Promise<GeoFix | null> {
    if (!('geolocation' in navigator) || !window.isSecureContext) {
      status.value = 'unsupported'
      message.value = window.isSecureContext
        ? 'Este navegador no permite obtener la ubicación.'
        : 'La ubicación automática requiere abrir el sitio con https o desde localhost.'
      return Promise.resolve(null)
    }

    status.value = 'locating'
    message.value = null
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fix.value = {
            lat: Number(position.coords.latitude.toFixed(6)),
            lng: Number(position.coords.longitude.toFixed(6)),
            accuracy: Math.round(position.coords.accuracy),
          }
          status.value = 'located'
          resolve(fix.value)
        },
        (error) => {
          const info = MESSAGES[error.code] ?? MESSAGES[2]!
          status.value = info.status
          message.value = info.message
          resolve(null)
        },
        { enableHighAccuracy: true, timeout: 15_000, maximumAge: 30_000 },
      )
    })
  }

  return { status, message, fix, locate }
}
