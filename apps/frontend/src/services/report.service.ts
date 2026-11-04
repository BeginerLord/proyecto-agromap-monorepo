import { reportsApi } from '@/api'
import type { ReportQuery } from '@/models'

export type CsvRow = Record<string, string | number | undefined>

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

export const reportService = {
  summary: (query: ReportQuery) => reportsApi.summary(query),

  /** "2026-10" → "oct 2026" */
  monthLabel(month: string): string {
    const [year, m] = month.split('-')
    return `${MONTHS[Number(m) - 1] ?? m} ${year}`
  },

  /** Lista continua de meses entre dos fechas (los meses sin datos también aparecen). */
  monthsBetween(from: string, to: string): string[] {
    const start = new Date(from)
    const end = new Date(to)
    const cursor = new Date(start.getFullYear(), start.getMonth(), 1)
    const months: string[] = []
    while (cursor <= end && months.length < 60) {
      months.push(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`)
      cursor.setMonth(cursor.getMonth() + 1)
    }
    return months
  },

  /** Descarga filas como CSV (separador ";" y BOM para que Excel en español lo abra bien). */
  downloadCsv(filename: string, rows: CsvRow[]) {
    if (!rows.length) return
    const headers = Object.keys(rows[0]!)
    const escape = (value: unknown) => {
      const text = String(value ?? '')
      return /[";\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
    }
    const csv = [headers.join(';'), ...rows.map((row) => headers.map((h) => escape(row[h])).join(';'))].join('\r\n')
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }))
    const link = Object.assign(document.createElement('a'), { href: url, download: `${filename}.csv` })
    link.click()
    URL.revokeObjectURL(url)
  },
}
