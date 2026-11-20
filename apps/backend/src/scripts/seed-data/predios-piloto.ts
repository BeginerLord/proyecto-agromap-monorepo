/**
 * Predios del piloto: Martínez y Mateo Gómez, con sus cultivos de ciclo corto, bitácora y una cosecha.
 * Son los datos que traía el seed original; se crean solo si el predio aún no existe (por nombre).
 */
import type { Types } from 'mongoose'
import { CropModel, FieldLogModel, HarvestModel, PlotModel } from '../../models/index.js'
import { addDays } from '../../utils/date.util.js'

/** Crea los predios que falten. Devuelve cuántos se crearon. */
export async function seedPilotPlots(adminId: Types.ObjectId, agronomistId: Types.ObjectId): Promise<number> {
  let created = 0
  const today = new Date()

  if (!(await PlotModel.exists({ name: 'Predio Martínez' }))) {
    const martinez = await PlotModel.create({
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
      createdBy: adminId,
    })
    const plantedAt = addDays(today, -40)
    const [aji, pepino] = await CropModel.create([
      { plot: martinez._id, species: 'Ají', variety: 'Dulce', status: 'growing', plantedAt, cycleDays: 90, expectedHarvestAt: addDays(plantedAt, 90), plantCount: 120, createdBy: agronomistId },
      { plot: martinez._id, species: 'Pepino', status: 'harvesting', plantedAt: addDays(today, -55), cycleDays: 55, expectedHarvestAt: today, plantCount: 80, createdBy: agronomistId },
    ])
    await FieldLogModel.create([
      { crop: aji!._id, plot: martinez._id, type: 'sowing', description: 'Siembra de plántulas de ají en surcos.', date: plantedAt, author: agronomistId },
      { crop: aji!._id, plot: martinez._id, type: 'irrigation', description: 'Riego por goteo, 30 minutos.', date: addDays(today, -2), author: agronomistId },
    ])
    await HarvestModel.create({
      crop: pepino!._id,
      plot: martinez._id,
      harvestedAt: addDays(today, -1),
      quantityKg: 35,
      availableKg: 35,
      quality: 'high',
      registeredBy: agronomistId,
    })
    created++
  }

  if (!(await PlotModel.exists({ name: 'Predio Mateo Gómez' }))) {
    const mateoGomez = await PlotModel.create({
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
      createdBy: adminId,
    })
    const habichuela = await CropModel.create({
      plot: mateoGomez._id,
      species: 'Habichuela',
      status: 'growing',
      plantedAt: addDays(today, -30),
      cycleDays: 60,
      expectedHarvestAt: addDays(today, 30),
      plantCount: 200,
      createdBy: agronomistId,
    })
    await FieldLogModel.create({
      crop: habichuela._id,
      plot: mateoGomez._id,
      type: 'pest_control',
      description: 'Control preventivo con extracto de neem.',
      date: addDays(today, -1),
      author: agronomistId,
    })
    created++
  }

  return created
}
