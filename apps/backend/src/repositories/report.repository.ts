import type { ReportSummaryDto } from '../dtos/index.js'
import type { IReportRepository, ReportRange } from '../interfaces/repositories/index.js'
import { CropModel, DistributionModel, FieldLogModel, HarvestModel, PlotModel } from '../models/index.js'

type Rows<K extends keyof ReportSummaryDto> = ReportSummaryDto[K]

const ACTIVE = ['planted', 'growing', 'harvesting']
const monthOf = (field: string) => ({ $dateToString: { format: '%Y-%m', date: `$${field}`, timezone: 'America/Bogota' } })
const round = (field: string) => ({ $round: [field, 2] })

/** Consultas de agregación de solo lectura para estadísticas y reportes. */
export class ReportRepository implements IReportRepository {
  harvestByMonth({ from, to }: ReportRange): Promise<Rows<'harvestByMonth'>> {
    return HarvestModel.aggregate([
      { $match: { harvestedAt: { $gte: from, $lte: to } } },
      { $group: { _id: monthOf('harvestedAt'), kg: { $sum: '$quantityKg' }, count: { $sum: 1 } } },
      { $project: { _id: 0, month: '$_id', kg: round('$kg'), count: 1 } },
      { $sort: { month: 1 } },
    ])
  }

  distributionByMonth({ from, to }: ReportRange): Promise<Rows<'distributionByMonth'>> {
    return DistributionModel.aggregate([
      { $match: { date: { $gte: from, $lte: to } } },
      {
        $group: {
          _id: monthOf('date'),
          kg: { $sum: '$totalKg' },
          beneficiaries: { $sum: '$beneficiaries' },
          count: { $sum: 1 },
        },
      },
      { $project: { _id: 0, month: '$_id', kg: round('$kg'), beneficiaries: 1, count: 1 } },
      { $sort: { month: 1 } },
    ])
  }

  harvestBySpecies({ from, to }: ReportRange): Promise<Rows<'harvestBySpecies'>> {
    return HarvestModel.aggregate([
      { $match: { harvestedAt: { $gte: from, $lte: to } } },
      { $lookup: { from: 'crops', localField: 'crop', foreignField: '_id', as: 'crop' } },
      { $unwind: '$crop' },
      { $group: { _id: '$crop.species', kg: { $sum: '$quantityKg' } } },
      { $project: { _id: 0, species: '$_id', kg: round('$kg') } },
      { $sort: { kg: -1 } },
    ])
  }

  distributedBySpecies({ from, to }: ReportRange): Promise<Rows<'distributedBySpecies'>> {
    return DistributionModel.aggregate([
      { $match: { date: { $gte: from, $lte: to } } },
      { $unwind: '$items' },
      { $group: { _id: '$items.species', kg: { $sum: '$items.quantityKg' } } },
      { $project: { _id: 0, species: '$_id', kg: round('$kg') } },
      { $sort: { kg: -1 } },
    ])
  }

  cropsByStatus(): Promise<Rows<'cropsByStatus'>> {
    return CropModel.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { _id: 0, key: '$_id', count: 1 } },
      { $sort: { count: -1 } },
    ])
  }

  fieldLogsByType({ from, to }: ReportRange): Promise<Rows<'fieldLogsByType'>> {
    return FieldLogModel.aggregate([
      { $match: { date: { $gte: from, $lte: to } } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $project: { _id: 0, key: '$_id', count: 1 } },
      { $sort: { count: -1 } },
    ])
  }

  plots({ from, to }: ReportRange): Promise<Rows<'plots'>> {
    return PlotModel.aggregate([
      { $lookup: { from: 'crops', localField: '_id', foreignField: 'plot', as: 'crops' } },
      {
        $lookup: {
          from: 'harvests',
          let: { plotId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$plot', '$$plotId'] }, harvestedAt: { $gte: from, $lte: to } } },
            { $group: { _id: null, kg: { $sum: '$quantityKg' } } },
          ],
          as: 'harvest',
        },
      },
      {
        $project: {
          _id: 0,
          plotId: { $toString: '$_id' },
          plot: '$name',
          district: '$location.district',
          crops: { $size: '$crops' },
          activeCrops: { $size: { $filter: { input: '$crops', cond: { $in: ['$$this.status', ACTIVE] } } } },
          harvestedKg: { $round: [{ $ifNull: [{ $first: '$harvest.kg' }, 0] }, 2] },
        },
      },
      { $sort: { harvestedKg: -1, plot: 1 } },
    ])
  }

  countFieldLogs({ from, to }: ReportRange): Promise<number> {
    return FieldLogModel.countDocuments({ date: { $gte: from, $lte: to } })
  }
}
