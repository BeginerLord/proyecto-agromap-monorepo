const DAY_MS = 86_400_000

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS)
}

export function toDate(value: string | Date | undefined): Date | undefined {
  if (value === undefined) return undefined
  return value instanceof Date ? value : new Date(value)
}
