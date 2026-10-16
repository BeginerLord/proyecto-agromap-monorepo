import swagger from '@fastify/swagger'
import scalar from '@scalar/fastify-api-reference'
import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import { env } from '../config/env.js'
import { COOKIE_NAMES } from '../constants/cookies.js'

/**
 * Documentación OpenAPI 3.1 generada desde los schemas (DTOs) de cada ruta
 * y servida con Scalar en `/docs`.
 */
export const docsPlugin = fp(async (app: FastifyInstance) => {
  await app.register(swagger, {
    openapi: {
      openapi: '3.1.0',
      info: {
        title: 'AgroMap-Cereté API',
        version: '0.1.0',
        description:
          'API para el mapeo, caracterización y seguimiento de cultivos en predios periurbanos ' +
          '(Martínez y Mateo Gómez) y la distribución de alimentos en las jornadas de apoyo alimentario del ' +
          'Centro Tutorial Cereté – Universidad de Cartagena.\n\n' +
          '**Autenticación:** la sesión viaja únicamente en cookies `httpOnly`. ' +
          'Ejecuta `POST /auth/login` desde esta documentación y las siguientes peticiones enviarán la cookie automáticamente.',
      },
      servers: [{ url: `http://localhost:${env.port}`, description: 'Local' }],
      tags: [
        { name: 'Sistema' },
        { name: 'Público', description: 'Sitio público: predios, jornadas, galería y experiencias (sin autenticación)' },
        { name: 'Auth', description: 'Registro, inicio y cierre de sesión (JWT en cookies httpOnly)' },
        { name: 'Usuarios', description: 'Administración de usuarios y roles' },
        { name: 'Dashboard' },
        { name: 'Predios', description: 'Predios periurbanos georreferenciados y su caracterización' },
        { name: 'Cultivos', description: 'Cultivos de ciclo corto por predio' },
        { name: 'Bitácora', description: 'Registros de campo por cultivo' },
        { name: 'Cosechas' },
        { name: 'Jornadas de apoyo', description: 'Entregas de alimentos a estudiantes' },
        { name: 'Evidencias', description: 'Fotos de predios, cultivos y jornadas' },
        { name: 'Experiencias', description: 'Moderación de comentarios del sitio público' },
        { name: 'Sensores (adapter)', description: 'Integración desacoplada con dispositivos IoT' },
      ],
      components: {
        securitySchemes: {
          cookieAuth: { type: 'apiKey', in: 'cookie', name: COOKIE_NAMES.ACCESS_TOKEN },
          sensorKey: { type: 'apiKey', in: 'header', name: 'x-sensor-key' },
        },
      },
    },
  })

  await app.register(scalar, {
    routePrefix: '/docs',
    logLevel: 'warn',
    configuration: {
      title: 'AgroMap-Cereté API',
      theme: 'kepler',
      layout: 'modern',
      withDefaultFonts: true,
      defaultHttpClient: { targetKey: 'js', clientKey: 'fetch' },
      metaData: { title: 'AgroMap API · Docs' },
    },
  })
})
