import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { controllers } from '../container.js'
import { ROLE_GROUPS } from '../constants/roles.js'
import {
  CreateDeviceDto,
  DeviceListResponseDto,
  DeviceResponseDto,
  ErrorResponseDto,
  IdParamDto,
  IngestBodyDto,
  IngestResultDto,
  PaginationQueryDto,
  ProviderListDto,
  ProviderParamDto,
  ReadingListResponseDto,
  ReadingQueryDto,
  UpdateDeviceDto,
  errorResponses,
} from '../dtos/index.js'
import { SENSOR_KEY_HEADER, authenticate, authorize, verifySensorKey } from '../middlewares/index.js'

export const sensorRoutes: FastifyPluginAsyncTypebox = async (app) => {
  const ctrl = controllers.sensors
  const tags = ['Sensores (adapter)']
  const security = [{ cookieAuth: [] }]
  const managers = [authenticate, authorize(...ROLE_GROUPS.MANAGERS)]

  app.get('/providers', {
    preHandler: [authenticate],
    schema: { tags, security, summary: 'Proveedores (adapters) registrados', response: { 200: ProviderListDto } },
    handler: ctrl.providers,
  })

  app.get('/devices', {
    preHandler: [authenticate],
    schema: {
      tags,
      security,
      summary: 'Listar dispositivos',
      querystring: PaginationQueryDto,
      response: { 200: DeviceListResponseDto },
    },
    handler: ctrl.listDevices,
  })

  app.get('/devices/:id', {
    preHandler: [authenticate],
    schema: {
      tags,
      security,
      summary: 'Obtener dispositivo',
      params: IdParamDto,
      response: { 200: DeviceResponseDto, 404: errorResponses[404] },
    },
    handler: ctrl.getDevice,
  })

  app.post('/devices', {
    preHandler: managers,
    schema: {
      tags,
      security,
      summary: 'Registrar dispositivo',
      body: CreateDeviceDto,
      response: { 201: DeviceResponseDto, 400: errorResponses[400], 409: errorResponses[409] },
    },
    handler: ctrl.createDevice,
  })

  app.patch('/devices/:id', {
    preHandler: managers,
    schema: {
      tags,
      security,
      summary: 'Actualizar dispositivo',
      params: IdParamDto,
      body: UpdateDeviceDto,
      response: { 200: DeviceResponseDto, 404: errorResponses[404] },
    },
    handler: ctrl.updateDevice,
  })

  app.delete('/devices/:id', {
    preHandler: managers,
    schema: {
      tags,
      security,
      summary: 'Eliminar dispositivo',
      params: IdParamDto,
      response: { 204: { type: 'null', description: 'Eliminado' }, 404: errorResponses[404] },
    },
    handler: ctrl.removeDevice,
  })

  app.get('/devices/:id/readings', {
    preHandler: [authenticate],
    schema: {
      tags,
      security,
      summary: 'Lecturas de un dispositivo',
      params: IdParamDto,
      querystring: ReadingQueryDto,
      response: { 200: ReadingListResponseDto, 404: errorResponses[404] },
    },
    handler: ctrl.listReadings,
  })

  app.post('/devices/:id/sync', {
    preHandler: managers,
    schema: {
      tags,
      security,
      summary: 'Sincronizar lecturas (modo PULL vía adapter)',
      params: IdParamDto,
      response: { 200: IngestResultDto, 404: errorResponses[404], 503: ErrorResponseDto },
    },
    handler: ctrl.syncDevice,
  })

  app.post('/ingest/:provider', {
    preHandler: [verifySensorKey],
    config: { rateLimit: { max: 600, timeWindow: '1 minute' } },
    schema: {
      tags,
      summary: 'Ingesta de lecturas (modo PUSH desde gateway/proveedor)',
      description: `Autenticación con el header \`${SENSOR_KEY_HEADER}\`. El cuerpo es el payload crudo del proveedor; el adapter correspondiente lo normaliza.`,
      security: [{ sensorKey: [] }],
      params: ProviderParamDto,
      body: IngestBodyDto,
      response: { 200: IngestResultDto, 400: errorResponses[400], 401: errorResponses[401], 503: ErrorResponseDto },
    },
    handler: ctrl.ingest,
  })
}
