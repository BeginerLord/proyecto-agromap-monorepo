import { timingSafeEqual } from 'node:crypto'
import type { FastifyRequest } from 'fastify'
import { env } from '../config/env.js'
import { ServiceUnavailableException, UnauthorizedException } from '../exceptions/index.js'

export const SENSOR_KEY_HEADER = 'x-sensor-key'

/** Protege el endpoint de ingesta: los gateways/dispositivos envían una clave compartida. */
export async function verifySensorKey(request: FastifyRequest): Promise<void> {
  if (!env.sensors.ingestKey) throw new ServiceUnavailableException('SENSOR_INGEST_KEY no está configurada')

  const received = request.headers[SENSOR_KEY_HEADER]
  const expected = Buffer.from(env.sensors.ingestKey)
  const provided = Buffer.from(typeof received === 'string' ? received : '')

  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    throw new UnauthorizedException('Clave de sensor inválida')
  }
}
