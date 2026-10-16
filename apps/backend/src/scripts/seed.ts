/**
 * Carga datos de ejemplo: usuario admin, los dos predios del piloto (Martínez y Mateo Gómez),
 * cultivos de ciclo corto (ají, pepino, habichuela), bitácora, una cosecha y un sensor simulado.
 *
 * Uso: pnpm seed   (es idempotente: no duplica si ya existe el admin)
 */
import mongoose from 'mongoose'
import { env } from '../config/env.js'
import { ROLES } from '../constants/roles.js'
import {
  CropModel,
  DeviceModel,
  FieldLogModel,
  HarvestModel,
  PlotModel,
  UserModel,
} from '../models/index.js'
import { BcryptPasswordHasher } from '../utils/password.util.js'
import { addDays } from '../utils/date.util.js'

const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@agromap.local'
const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'Admin12345*'

async function seed() {
  await mongoose.connect(env.mongoUri)
  const hasher = new BcryptPasswordHasher()

  if (await UserModel.exists({ email: adminEmail })) {
    console.log(`ℹ️  El usuario ${adminEmail} ya existe; seed omitido.`)
    return
  }

  const [admin, agronomist] = await UserModel.create([
    { name: 'Administrador AgroMap', email: adminEmail, passwordHash: await hasher.hash(adminPassword), role: ROLES.ADMIN },
    {
      name: 'Ingeniero Agrónomo',
      email: 'agronomo@agromap.local',
      passwordHash: await hasher.hash('Agro12345*'),
      role: ROLES.AGRONOMIST,
    },
  ])

  const [martinez, mateoGomez] = await PlotModel.create([
    {
      name: 'Predio Martínez',
      owner: { name: 'Familia Martínez', phone: '300 000 0000' },
      location: {
        municipality: 'Cereté',
        district: 'Martínez',
        point: { type: 'Point', coordinates: [-75.7694, 8.8702] },
      },
      areaM2: 2500,
      characterization: {
        soilType: 'Franco arcilloso',
        waterAccess: 'limited',
        sunExposure: 'high',
        landUseHistory: 'Pastoreo y cultivos de pancoger',
      },
      createdBy: admin!._id,
    },
    {
      name: 'Predio Mateo Gómez',
      owner: { name: 'Familia Gómez' },
      location: {
        municipality: 'Cereté',
        district: 'Mateo Gómez',
        point: { type: 'Point', coordinates: [-75.8166, 8.8432] },
      },
      areaM2: 1800,
      characterization: {
        soilType: 'Franco arenoso',
        waterAccess: 'permanent',
        sunExposure: 'medium',
        landUseHistory: 'Huerta familiar',
      },
      createdBy: admin!._id,
    },
  ])

  const today = new Date()
  const plantedAt = addDays(today, -40)
  const crops = await CropModel.create([
    { plot: martinez!._id, species: 'Ají', variety: 'Dulce', status: 'growing', plantedAt, cycleDays: 90, expectedHarvestAt: addDays(plantedAt, 90), plantCount: 120, createdBy: agronomist!._id },
    { plot: martinez!._id, species: 'Pepino', status: 'harvesting', plantedAt: addDays(today, -55), cycleDays: 55, expectedHarvestAt: today, plantCount: 80, createdBy: agronomist!._id },
    { plot: mateoGomez!._id, species: 'Habichuela', status: 'growing', plantedAt: addDays(today, -30), cycleDays: 60, expectedHarvestAt: addDays(today, 30), plantCount: 200, createdBy: agronomist!._id },
  ])

  await FieldLogModel.create([
    { crop: crops[0]!._id, plot: martinez!._id, type: 'sowing', description: 'Siembra de plántulas de ají en surcos.', date: plantedAt, author: agronomist!._id },
    { crop: crops[0]!._id, plot: martinez!._id, type: 'irrigation', description: 'Riego por goteo, 30 minutos.', date: addDays(today, -2), author: agronomist!._id },
    { crop: crops[2]!._id, plot: mateoGomez!._id, type: 'pest_control', description: 'Control preventivo con extracto de neem.', date: addDays(today, -1), author: agronomist!._id },
  ])

  await HarvestModel.create({
    crop: crops[1]!._id,
    plot: martinez!._id,
    harvestedAt: addDays(today, -1),
    quantityKg: 35,
    availableKg: 35,
    quality: 'high',
    registeredBy: agronomist!._id,
  })

  await DeviceModel.create({
    name: 'Sonda de suelo (simulada)',
    provider: 'mock',
    externalId: 'mock-01',
    kind: 'soil-probe',
    metrics: ['soil_moisture', 'soil_temperature', 'air_humidity'],
    plot: martinez!._id,
    status: 'active',
  })

  console.log('✅ Seed completado')
  console.log(`   Admin:     ${adminEmail} / ${adminPassword}`)
  console.log('   Agrónomo:  agronomo@agromap.local / Agro12345*')
}

seed()
  .catch((error) => {
    console.error('❌ Error en el seed', error)
    process.exitCode = 1
  })
  .finally(() => mongoose.disconnect())
