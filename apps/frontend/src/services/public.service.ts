import { commentsApi, mediaApi, publicApi } from '@/api'
import type { CommentPayload, CommentQuery, MediaOwner, PaginationQuery, PublicCommentQuery } from '@/models'

const MAX_UPLOAD_MB = 5
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export const publicService = {
  overview: () => publicApi.overview(),
  plots: async () => (await publicApi.plots()).data,
  plot: (id: string) => publicApi.plot(id),
  distributions: (query: PaginationQuery) => publicApi.distributions(query),
  gallery: (limit?: number) => publicApi.gallery(limit),
  comments: (query: PublicCommentQuery) => publicApi.comments(query),

  submitComment: (payload: CommentPayload) =>
    publicApi.submitComment({
      ...payload,
      authorName: payload.authorName.trim(),
      message: payload.message.trim(),
    }),
}

export const mediaService = {
  list: async (owner: MediaOwner) => (await mediaApi.list(owner)).data,
  update: mediaApi.update,
  remove: mediaApi.remove,

  /** Valida en el cliente antes de subir (el backend vuelve a validar el tipo real). */
  upload(file: File, owner: MediaOwner, caption?: string) {
    if (!IMAGE_TYPES.includes(file.type)) throw new Error('Solo se permiten imágenes JPG, PNG o WEBP')
    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) throw new Error(`La imagen supera ${MAX_UPLOAD_MB} MB`)
    return mediaApi.upload(file, owner, caption?.trim() || undefined)
  },
}

export const commentService = {
  list: (query: CommentQuery) => commentsApi.list(query),
  stats: () => commentsApi.stats(),
  approve: (id: string) => commentsApi.moderate(id, 'approved'),
  reject: (id: string) => commentsApi.moderate(id, 'rejected'),
  remove: (id: string) => commentsApi.remove(id),
}
