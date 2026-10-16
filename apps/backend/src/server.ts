import { buildApp } from './app.js'
import { connectDatabase, disconnectDatabase } from './config/database.js'
import { env } from './config/env.js'
import { sensorRegistry } from './container.js'

async function bootstrap() {
  const app = await buildApp()

  try {
    await connectDatabase(app.log)
    if (env.sensors.enabled) await sensorRegistry.connectAll()

    await app.listen({ host: env.host, port: env.port })
    app.log.info(`📚 Documentación: http://localhost:${env.port}/docs`)
  } catch (error) {
    app.log.fatal({ err: error }, 'No se pudo iniciar el servidor')
    process.exit(1)
  }

  const shutdown = async (signal: string) => {
    app.log.info(`${signal} recibido, cerrando...`)
    await app.close()
    await sensorRegistry.disconnectAll()
    await disconnectDatabase()
    process.exit(0)
  }

  process.once('SIGINT', () => void shutdown('SIGINT'))
  process.once('SIGTERM', () => void shutdown('SIGTERM'))
}

void bootstrap()
