const LOCALE = 'es-CO'

const dateFmt = new Intl.DateTimeFormat(LOCALE, { day: '2-digit', month: 'short', year: 'numeric' })
const shortDateFmt = new Intl.DateTimeFormat(LOCALE, { day: '2-digit', month: 'short' })
const dateTimeFmt = new Intl.DateTimeFormat(LOCALE, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
const numberFmt = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 1 })

export const formatDate = (value?: string | Date) => (value ? dateFmt.format(new Date(value)) : '—')
export const formatShortDate = (value?: string | Date) => (value ? shortDateFmt.format(new Date(value)) : '—')
export const formatDateTime = (value?: string | Date) => (value ? dateTimeFmt.format(new Date(value)) : '—')
export const formatNumber = (value?: number) => (value === undefined ? '—' : numberFmt.format(value))
export const formatKg = (value?: number) => (value === undefined ? '—' : `${numberFmt.format(value)} kg`)
export const formatArea = (m2?: number) => {
  if (m2 === undefined) return '—'
  return m2 >= 10_000 ? `${numberFmt.format(m2 / 10_000)} ha` : `${numberFmt.format(m2)} m²`
}

const DAY_MS = 86_400_000

/** Días enteros entre hoy y la fecha (negativo si ya pasó). */
export function daysFromToday(value: string | Date): number {
  const target = new Date(value)
  const today = new Date()
  target.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / DAY_MS)
}

export function formatRelativeDays(value?: string | Date): string {
  if (!value) return '—'
  const days = daysFromToday(value)
  if (days === 0) return 'hoy'
  if (days === 1) return 'mañana'
  if (days === -1) return 'ayer'
  return days > 0 ? `en ${days} días` : `hace ${Math.abs(days)} días`
}

/** Convierte un ISO a valor para <input type="date">. */
export const toDateInput = (value?: string) => (value ? value.slice(0, 10) : '')

/** Convierte el valor de <input type="date"> a ISO (mediodía local para evitar saltos de zona). */
export const fromDateInput = (value: string) => (value ? new Date(`${value}T12:00:00`).toISOString() : undefined)

export const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

const HTML_ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }

/** Escapa texto antes de interpolarlo en HTML crudo (p. ej. popups de Leaflet). */
export const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char] ?? char)
