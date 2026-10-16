import mongoose from 'mongoose'
import type { FastifyBaseLogger } from 'fastify'
import { env } from './env.js'

export async function connectDatabase(logger: FastifyBaseLogger): Promise<typeof mongoose> {
  mongoose.set('strictQuery', true)

  mongoose.connection.on('connected', () => logger.info('MongoDB conectado'))
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB desconectado'))
  mongoose.connection.on('error', (error) => logger.error({ err: error }, 'Error de MongoDB'))

  return mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 5000 })
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect()
}
