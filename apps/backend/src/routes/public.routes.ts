import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import Type from 'typebox'
import { controllers } from '../container.js'
import {
  CommentSubmittedDto,
  CreatePublicCommentDto,
  IdParamDto,
  PaginationQueryDto,
  PublicCommentListDto,
  PublicCommentQueryDto,
  PublicDistributionListDto,
  PublicGalleryQueryDto,
  PublicMediaDto,
  PublicOverviewDto,
  PublicPlotDetailDto,
  PublicPlotListDto,
  errorResponses,
} from '../dtos/index.js'

/** Sitio público: lectura abierta y envío de experiencias (sin autenticación). */
export const publicRoutes: FastifyPluginAsyncTypebox = async (app) => {
  const ctrl = controllers.public
  const tags = ['Público']

  app.get('/overview', {
    schema: { tags, summary: 'Indicadores generales del proyecto', response: { 200: PublicOverviewDto } },
    handler: ctrl.overview,
  })

  app.get('/plots', {
    schema: {
      tags,
      summary: 'Puntos periurbanos activos con foto de portada y cultivos',
      response: { 200: PublicPlotListDto },
    },
    handler: ctrl.plots,
  })

  app.get('/plots/:id', {
    schema: {
      tags,
      summary: 'Detalle público de un predio con galería de evidencias',
      params: IdParamDto,
      response: { 200: PublicPlotDetailDto, 404: errorResponses[404] },
    },
    handler: ctrl.plot,
  })

  app.get('/distributions', {
    schema: {
      tags,
      summary: 'Jornadas de apoyo alimentario con fotos',
      querystring: PaginationQueryDto,
      response: { 200: PublicDistributionListDto },
    },
    handler: ctrl.distributions,
  })

  app.get('/gallery', {
    schema: {
      tags,
      summary: 'Últimas fotos públicas',
      querystring: PublicGalleryQueryDto,
      response: { 200: Type.Array(PublicMediaDto) },
    },
    handler: ctrl.gallery,
  })

  app.get('/comments', {
    schema: {
      tags,
      summary: 'Experiencias aprobadas',
      querystring: PublicCommentQueryDto,
      response: { 200: PublicCommentListDto },
    },
    handler: ctrl.comments,
  })

  app.post('/comments', {
    config: { rateLimit: { max: 5, timeWindow: '10 minutes' } },
    schema: {
      tags,
      summary: 'Compartir una experiencia',
      description: 'Queda en estado pendiente hasta que un administrador o agrónomo la apruebe.',
      body: CreatePublicCommentDto,
      response: { 202: CommentSubmittedDto, 400: errorResponses[400] },
    },
    handler: ctrl.submitComment,
  })
}
