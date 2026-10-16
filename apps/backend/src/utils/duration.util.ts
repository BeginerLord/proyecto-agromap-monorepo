const UNIT_MS: Record<string, number> = {
  ms: 1,
  s: 1000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
  w: 604_800_000,
}

/** Convierte duraciones tipo "15m", "7d", "3600s" a milisegundos. */
export function durationToMs(value: string): number {
  const match = /^(\d+)\s*(ms|s|m|h|d|w)?$/i.exec(value.trim())
  if (!match) throw new Error(`Duración inválida: "${value}"`)
  const amount = Number(match[1])
  const unit = (match[2] ?? 's').toLowerCase()
  return amount * (UNIT_MS[unit] ?? 1000)
}

export function durationToSeconds(value: string): number {
  return Math.floor(durationToMs(value) / 1000)
}
