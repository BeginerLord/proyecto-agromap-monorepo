import type {
  Comment,
  CommentPayload,
  CommentQuery,
  Media,
  MediaOwner,
  Paginated,
  PaginationQuery,
  PublicComment,
  PublicCommentQuery,
  PublicDistribution,
  PublicMedia,
  PublicOverview,
  PublicPlot,
  PublicPlotDetail,
} from '@/models'
import { cleanParams, http, request } from './http'

/** Endpoints abiertos (sin sesión). */
export const publicApi = {
  overview: () => request.get<PublicOverview>('/public/overview'),
  plots: () => request.get<{ data: PublicPlot[] }>('/public/plots'),
  plot: (id: string) => request.get<PublicPlotDetail>(`/public/plots/${id}`),
  distributions: (query: PaginationQuery = {}) =>
    request.get<Paginated<PublicDistribution>>('/public/distributions', { params: cleanParams(query) }),
  gallery: (limit = 12) => request.get<PublicMedia[]>('/public/gallery', { params: { limit } }),
  comments: (query: PublicCommentQuery = {}) =>
    request.get<Paginated<PublicComment>>('/public/comments', { params: cleanParams(query) }),
  submitComment: (payload: CommentPayload) =>
    request.post<{ message: string; status: string }>('/public/comments', payload),
}

/** Evidencias fotográficas (panel). */
export const mediaApi = {
  list: (owner: MediaOwner) =>
    request.get<Paginated<Media>>('/media', { params: cleanParams({ ...owner, limit: 100 }) }),
  upload: (file: File, owner: MediaOwner, caption?: string) => {
    const form = new FormData()
    // Los campos de texto van antes del archivo (el backend los lee al recibir `file`)
    if (caption) form.append('caption', caption)
    for (const [key, value] of Object.entries(owner)) if (value) form.append(key, value)
    form.append('file', file)
    return http
      .post<Media>('/media', form, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60_000 })
      .then((r) => r.data)
  },
  update: (id: string, payload: { caption?: string; isPublic?: boolean }) => request.patch<Media>(`/media/${id}`, payload),
  remove: (id: string) => request.delete(`/media/${id}`),
}

/** Moderación de experiencias (panel). */
export const commentsApi = {
  list: (query: CommentQuery = {}) => request.get<Paginated<Comment>>('/comments', { params: cleanParams(query) }),
  stats: () => request.get<Record<string, number>>('/comments/stats'),
  moderate: (id: string, status: Comment['status']) => request.patch<Comment>(`/comments/${id}/status`, { status }),
  remove: (id: string) => request.delete(`/comments/${id}`),
}
