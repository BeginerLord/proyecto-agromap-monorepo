/**
 * Genera el mapa estático (Mapbox) de los predios que aún no lo tienen.
 * Hace como máximo una petición por predio; los que ya tienen snapshot vigente se omiten.
 *
 * Uso: pnpm --filter @agromap/backend map-snapshots
 *      (en Docker: docker compose exec backend node dist/scripts/map-snapshots.js)
 */
import mongoose from 'mongoose'
import { MapboxStaticMapAdapter } from '../adapters/maps/index.js'
import { createFileStorage } from '../adapters/storage/index.js'
import { env } from '../config/env.js'
import { PlotRepository } from '../repositories/index.js'
import { MapSnapshotService } from '../services/map-snapshot.service.js'

async function run() {
  await mongoose.connect(env.mongoUri)
  const plots = new PlotRepository()
  const snapshots = new MapSnapshotService(
    new MapboxStaticMapAdapter({ accessToken: env.mapbox.accessToken, style: env.mapbox.style }),
    createFileStorage(),
    plots,
  )
  if (!snapshots.isEnabled()) {
    console.log('ℹ️  Define MAPBOX_ACCESS_TOKEN (y MAPBOX_SNAPSHOTS=true) en el .env del backend.')
    return
  }

  const { items } = await plots.findMany({ filter: {}, page: 1, limit: 1000 })
  let created = 0
  let current = 0
  let failed = 0
  for (const plot of items) {
    const before = plot.mapSnapshot?.url
    const after = (await snapshots.ensure(plot)).mapSnapshot?.url
    if (!after) failed++
    else if (after === before) current++
    else created++
  }
  console.log(`✅ ${created} mapas generados · ${current} ya estaban al día · ${failed} fallaron`)
}

run()
  .catch((error) => {
    console.error('❌', error)
    process.exitCode = 1
  })
  .finally(() => mongoose.disconnect())
