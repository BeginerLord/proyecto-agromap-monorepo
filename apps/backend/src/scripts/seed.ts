/**
 * Carga los tres predios: Predio Martínez y Predio Mateo Gómez (piloto) y la Granja Avícola Doctora Pollo.
 * De la granja carga la trazabilidad agrícola 2026:
 * usuarios base, el predio, los cinco lotes (berenjena, ají, yuca, pepino, habichuela) con su
 * cronograma de referencia y fuentes, la bitácora de actividades (ACT-xxx) y las cosechas (COS-xxx).
 * Los datos salen de «Agromap_Trazabilidad_Agricola_2026.xlsx» (ver scripts/seed-data).
 *
 * Uso:
 *   pnpm seed                                  crea lo que falte (no toca registros existentes)
 *   pnpm seed -- --refresh                     además sobrescribe los registros del seed con los datos del Excel
 *   SEED_PHOTOS_DIR=D:/Workspace/Datos pnpm seed   sube también las fotos de evidencia (convertidas a WebP)
 *
 * Es idempotente: identifica los predios por nombre, los lotes por código AGR y los registros por código ACT/COS.
 */
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import mongoose, { type Document, type Model, type Types } from 'mongoose'
import { createFileStorage } from '../adapters/storage/index.js'
import { env } from '../config/env.js'
import { ROLES, type Role } from '../constants/roles.js'
import { CropModel, FieldLogModel, HarvestModel, MediaModel, PlotModel, UserModel } from '../models/index.js'
import { BcryptPasswordHasher } from '../utils/password.util.js'
import { toWebp } from '../utils/image.util.js'
import { PHOTOS } from './seed-data/fotos-2026.js'
import { seedPilotPlots } from './seed-data/predios-piloto.js'
import {
  ACTIVITIES,
  DATASET_NAME,
  FARM,
  GENERAL_NOTES,
  HARVESTS,
  LOTS,
  REFERENCE_SCHEDULE,
  type SeedMilestone,
} from './seed-data/trazabilidad-2026.js'

const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@agromap.local'
const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'Admin12345*'
const agronomistEmail = 'agronomo@agromap.local'
const agronomistPassword = 'Agro12345*'
const photosDir = process.env.SEED_PHOTOS_DIR?.trim()
const refresh = process.argv.includes('--refresh')

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

/** "2026-07-07" → mediodía en Colombia (UTC-5), para que la fecha no cambie de día al mostrarse. */
const day = (value: string) => new Date(`${value}T12:00:00-05:00`)

/** Fechas del hito: usa las del Excel o, para periodos como "Julio 2026", el mes completo. */
function milestoneDates(milestone: SeedMilestone): { startDate?: Date; endDate?: Date } {
  if (milestone.startDate) {
    return { startDate: day(milestone.startDate), endDate: milestone.endDate ? day(milestone.endDate) : undefined }
  }
  const match = /^(\p{L}+)\s+(\d{4})$/u.exec(milestone.period.trim())
  const month = match ? MONTHS.indexOf(match[1]!.toLowerCase()) : -1
  if (!match || month < 0) return {}
  const year = Number(match[2])
  const pad = (n: number) => String(n).padStart(2, '0')
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  return { startDate: day(`${year}-${pad(month + 1)}-01`), endDate: day(`${year}-${pad(month + 1)}-${pad(lastDay)}`) }
}

const counters = { created: 0, existing: 0, updated: 0 }

type SeedDocument = Document & { _id: Types.ObjectId }

/** Crea el documento si no existe; con --refresh lo actualiza con los datos del seed. */
async function upsert(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: Model<any>,
  filter: Record<string, unknown>,
  data: Record<string, unknown>,
): Promise<SeedDocument> {
  const existing: SeedDocument | null = await model.findOne(filter)
  if (!existing) {
    counters.created++
    return model.create(data)
  }
  if (refresh) {
    counters.updated++
    existing.set(data)
    return existing.save()
  }
  counters.existing++
  return existing
}

async function ensureUsers() {
  const hasher = new BcryptPasswordHasher()
  const ensure = async (name: string, email: string, password: string, role: Role) =>
    (await UserModel.findOne({ email })) ??
    (await UserModel.create({ name, email, passwordHash: await hasher.hash(password), role }))

  const admin = await ensure('Administrador AgroMap', adminEmail, adminPassword, ROLES.ADMIN)
  const agronomist = await ensure('Ingeniero Agrónomo', agronomistEmail, agronomistPassword, ROLES.AGRONOMIST)
  return { admin, agronomist }
}

async function seedPlot(adminId: Types.ObjectId) {
  const units = FARM.units
    .map((unit) => `${unit.name}: ${unit.areaM2.toLocaleString('es-CO')} m² (${unit.share.toLocaleString('es-CO')} %)`)
    .join('; ')
  const assumptions = GENERAL_NOTES.filter((n) => ['Fecha base', 'Datos reales vs estimados', 'Supuesto de siembra'].includes(n.topic))
    .map((n) => `${n.topic}: ${n.note}`)
    .join('\n')

  return upsert(
    PlotModel,
    { name: FARM.name },
    {
      name: FARM.name,
      owner: { name: FARM.ownerName },
      location: {
        municipality: FARM.municipality,
        district: FARM.district,
        address: `8°55'22.58"N 75°36'48.59"W`,
        point: { type: 'Point', coordinates: FARM.coordinates },
      },
      areaM2: FARM.areaM2,
      characterization: {
        landUseHistory: FARM.landUseHistory,
        notes: `Unidades agrícolas (${DATASET_NAME}): ${units}.\nLas hortalizas ocupan el 6,2 % del área productiva.\n\n${assumptions}`,
      },
      status: 'active',
      createdBy: adminId,
    },
  )
}

async function seedCrops(plotId: Types.ObjectId, authorId: Types.ObjectId) {
  const crops = new Map<string, { id: Types.ObjectId; species: string }>()
  for (const lot of LOTS) {
    const schedule = REFERENCE_SCHEDULE.filter((m) => m.crop === 'Todos' || m.crop === lot.species).map((m) => ({
      period: m.period,
      ...milestoneDates(m),
      milestone: m.milestone,
      requiredRecord: m.requiredRecord,
      infoType: m.infoType,
    }))

    const crop = await upsert(
      CropModel,
      { 'traceability.lotCode': lot.lotCode },
      {
        plot: plotId,
        species: lot.species,
        variety: lot.variety,
        status: lot.status,
        plantedAt: day(lot.plantedAt),
        expectedHarvestAt: day(lot.expectedHarvestAt),
        cycleDays: lot.cycleDays,
        notes: `${lot.lotCode} · ${lot.statusNote}. ${lot.notes}`,
        traceability: {
          lotCode: lot.lotCode,
          initialQuantity: lot.initialQuantity,
          quantityUnit: lot.quantityUnit,
          sowingMethod: lot.sowingMethod,
          firstHarvestAt: lot.firstHarvestAt ? day(lot.firstHarvestAt) : undefined,
          harvestEndAt: day(lot.harvestEndAt),
          cycleReference: lot.cycleReference,
          statusNote: lot.statusNote,
          evidence: lot.evidence,
          sources: lot.sources,
          schedule,
        },
        createdBy: authorId,
      },
    )
    crops.set(lot.lotCode, { id: crop._id, species: lot.species })
  }
  return crops
}

async function seedFieldLogs(plotId: Types.ObjectId, crops: Map<string, { id: Types.ObjectId }>, authorId: Types.ObjectId) {
  for (const activity of ACTIVITIES) {
    const crop = crops.get(activity.lotCode)
    if (!crop) throw new Error(`La actividad ${activity.code} apunta al lote inexistente ${activity.lotCode}`)
    await upsert(
      FieldLogModel,
      { 'traceability.code': activity.code },
      {
        crop: crop.id,
        plot: plotId,
        date: day(activity.date),
        type: activity.type,
        description: `${activity.activity}${activity.estimated ? ' (estimado)' : ''}. ${activity.detail}`,
        author: authorId,
        source: 'manual',
        traceability: {
          code: activity.code,
          activity: activity.activity,
          dataOrigin: activity.dataOrigin,
          estimated: activity.estimated,
          recordStatus: activity.recordStatus,
          evidence: activity.evidence,
          photoUrl: activity.photoUrl,
        },
      },
    )
  }
}

async function seedHarvests(plotId: Types.ObjectId, crops: Map<string, { id: Types.ObjectId }>, authorId: Types.ObjectId) {
  for (const harvest of HARVESTS) {
    const crop = crops.get(harvest.lotCode)
    if (!crop) throw new Error(`La cosecha ${harvest.code} apunta al lote inexistente ${harvest.lotCode}`)
    // El Excel aún no trae peso: se registra en 0 kg y queda pendiente de completar
    const kg = harvest.weightKg ?? 0
    await upsert(
      HarvestModel,
      { 'traceability.code': harvest.code },
      {
        crop: crop.id,
        plot: plotId,
        harvestedAt: day(harvest.date),
        quantityKg: kg,
        availableKg: kg,
        quality: 'medium',
        notes: `${harvest.code} · ${harvest.harvestType}. ${harvest.notes}`,
        registeredBy: authorId,
        traceability: {
          code: harvest.code,
          activity: harvest.harvestType,
          dataOrigin: harvest.dataOrigin,
          estimated: harvest.estimated,
          recordStatus: harvest.weightKg === undefined ? 'pending' : 'to_verify',
          evidence: harvest.evidence,
          photoUrl: harvest.photoUrl,
        },
      },
    )
  }
}

async function seedPhotos(plotId: Types.ObjectId, crops: Map<string, { id: Types.ObjectId; species: string }>, uploaderId: Types.ObjectId) {
  if (!photosDir) {
    console.log('ℹ️  Fotos omitidas: define SEED_PHOTOS_DIR con la carpeta de las imágenes para subirlas.')
    return
  }
  const storage = createFileStorage()
  let uploaded = 0
  for (const photo of PHOTOS) {
    const crop = photo.lotCode ? crops.get(photo.lotCode) : undefined
    const relation = { plot: plotId, crop: crop?.id }
    if (await MediaModel.exists({ plot: plotId, caption: photo.caption })) continue

    let buffer: Buffer
    try {
      buffer = await readFile(join(photosDir, photo.file))
    } catch {
      console.warn(`⚠️  No se encontró la foto ${photo.file}; se omite.`)
      continue
    }
    const optimized = await toWebp(buffer, { maxDimension: env.images.maxDimension, quality: env.images.webpQuality })
    const stored = await storage.save({ content: optimized.buffer, extension: optimized.extension, contentType: optimized.mimeType })
    await MediaModel.create({
      url: stored.url,
      storageKey: stored.key,
      mimeType: optimized.mimeType,
      size: optimized.buffer.length,
      caption: photo.caption,
      isPublic: true,
      uploadedBy: uploaderId,
      ...relation,
    })
    uploaded++
  }
  console.log(`📷 Fotos subidas: ${uploaded} (de ${PHOTOS.length})`)
}

async function seed() {
  await mongoose.connect(env.mongoUri)
  // Asegura los índices únicos de trazabilidad antes de insertar
  await Promise.all([CropModel.syncIndexes(), FieldLogModel.syncIndexes(), HarvestModel.syncIndexes()])

  const { admin, agronomist } = await ensureUsers()
  const pilotCreated = await seedPilotPlots(admin._id, agronomist._id)
  const plot = await seedPlot(admin._id)
  const crops = await seedCrops(plot._id, agronomist._id)
  await seedFieldLogs(plot._id, crops, agronomist._id)
  await seedHarvests(plot._id, crops, agronomist._id)
  await seedPhotos(plot._id, crops, agronomist._id)

  console.log(`✅ Seed «${DATASET_NAME}» completado${refresh ? ' (--refresh)' : ''}`)
  console.log(`   Registros creados: ${counters.created} · ya existían: ${counters.existing} · actualizados: ${counters.updated}`)
  console.log(`   Predios piloto (Martínez, Mateo Gómez): ${pilotCreated ? `${pilotCreated} creados` : 'ya existían'}`)
  console.log(`   Predio: ${FARM.name} · ${LOTS.length} lotes · ${ACTIVITIES.length} actividades · ${HARVESTS.length} cosechas`)
  console.log(`   Admin:     ${adminEmail} / ${adminPassword}`)
  console.log(`   Agrónomo:  ${agronomistEmail} / ${agronomistPassword}`)
}

seed()
  .catch((error) => {
    console.error('❌ Error en el seed', error)
    process.exitCode = 1
  })
  .finally(() => mongoose.disconnect())
