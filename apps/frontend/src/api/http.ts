import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios'
import { API_URL } from '@/constants/app'
import type { ApiErrorBody } from '@/models'

/** Error normalizado que reciben services y componentes. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code = 'ERROR',
    public readonly details: ApiErrorBody['details'] = [],
  ) {
    super(message)
  }
}

/**
 * Cliente HTTP único. `withCredentials` hace que el navegador envíe las cookies httpOnly
 * con el JWT; el frontend nunca lee ni almacena el token.
 */
export const http = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
})

// ─── Renovación transparente de la sesión ────────────────
const AUTH_FREE_PATHS = ['/auth/login', '/auth/register', '/auth/refresh']
let refreshing: Promise<void> | null = null
const sessionListeners = new Set<() => void>()

/** Permite al store de auth reaccionar cuando la sesión no puede renovarse. */
export function onSessionExpired(listener: () => void): () => void {
  sessionListeners.add(listener)
  return () => sessionListeners.delete(listener)
}

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean }

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const config = error.config as RetriableConfig | undefined
    const isAuthFree = AUTH_FREE_PATHS.some((path) => config?.url?.includes(path))

    if (error.response?.status === 401 && config && !config._retried && !isAuthFree) {
      config._retried = true
      try {
        refreshing ??= http.post('/auth/refresh').then(() => undefined)
        await refreshing
        return http(config)
      } catch {
        sessionListeners.forEach((listener) => listener())
      } finally {
        refreshing = null
      }
    }

    return Promise.reject(toApiError(error))
  },
)

function toApiError(error: AxiosError<ApiErrorBody>): ApiError {
  if (!error.response) return new ApiError(0, 'No hay conexión con el servidor', 'NETWORK_ERROR')
  const body = error.response.data
  return new ApiError(error.response.status, body?.message ?? error.message, body?.error, body?.details)
}

/** Helpers tipados que devuelven directamente el `data` de la respuesta. */
export const request = {
  get: <T>(url: string, config?: AxiosRequestConfig) => http.get<T>(url, config).then((r) => r.data),
  post: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    http.post<T>(url, body, config).then((r) => r.data),
  patch: <T>(url: string, body?: unknown) => http.patch<T>(url, body).then((r) => r.data),
  delete: (url: string) => http.delete(url).then(() => undefined),
}

/** Elimina parámetros vacíos antes de enviarlos como querystring. */
export function cleanParams<T extends object>(params: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  ) as Partial<T>
}
