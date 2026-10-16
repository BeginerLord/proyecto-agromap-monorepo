import type { UserRef } from '../common/ref.interface.js'

export interface DistributionItem {
  harvest: string
  species: string
  quantityKg: number
}

/** Entrega de alimentos durante una jornada sabatina. */
export interface Distribution {
  id: string
  date: Date
  title: string
  items: DistributionItem[]
  totalKg: number
  beneficiaries: number
  notes?: string
  createdBy: UserRef
  createdAt: Date
  updatedAt: Date
}
