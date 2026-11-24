/**
 * Fotos de evidencia de la carpeta de datos (WhatsApp, 20/11/2026), clasificadas por lote.
 * `lotCode` ausente = foto general del predio. El seed las sube solo si se define SEED_PHOTOS_DIR.
 */
export interface SeedPhoto {
  file: string
  lotCode?: string
  caption: string
}

const whatsapp = (time: string) => `WhatsApp Image 2026-11-20 at ${time} AM.jpeg`

export const PHOTOS: SeedPhoto[] = [
  { file: whatsapp('10.54.02'), lotCode: 'AGR-2026-002', caption: 'Ají: plantas en producción' },
  { file: whatsapp('10.54.05'), lotCode: 'AGR-2026-002', caption: 'Ají: surcos junto al galpón' },
  { file: whatsapp('10.54.06'), lotCode: 'AGR-2026-002', caption: 'Ají: vista del lote' },
  { file: whatsapp('10.54.07'), lotCode: 'AGR-2026-002', caption: 'Ají: frutos verdes' },
  { file: whatsapp('10.54.09'), lotCode: 'AGR-2026-001', caption: 'Berenjena: vista del lote' },
  { file: whatsapp('10.54.10'), lotCode: 'AGR-2026-001', caption: 'Berenjena: plantas en el lote' },
  { file: whatsapp('10.54.12'), lotCode: 'AGR-2026-001', caption: 'Berenjena: planta con fruto' },
  { file: whatsapp('10.54.13'), lotCode: 'AGR-2026-001', caption: 'Berenjena: fruto listo para cosecha' },
  { file: whatsapp('10.54.15'), lotCode: 'AGR-2026-001', caption: 'Berenjena: fruto listo para cosecha (2)' },
  { file: whatsapp('10.54.16'), lotCode: 'AGR-2026-001', caption: 'Berenjena: frutos en desarrollo' },
  { file: whatsapp('10.54.17'), lotCode: 'AGR-2026-001', caption: 'Berenjena: frutos en desarrollo (2)' },
  { file: whatsapp('10.54.19'), lotCode: 'AGR-2026-001', caption: 'Berenjena: planta con fruto (2)' },
  { file: whatsapp('10.54.20'), lotCode: 'AGR-2026-003', caption: 'Yuca: lote en desarrollo' },
  { file: whatsapp('10.54.21'), lotCode: 'AGR-2026-003', caption: 'Yuca: lote en desarrollo (2)' },
  { file: whatsapp('10.54.23'), lotCode: 'AGR-2026-003', caption: 'Yuca: plantas en engrosamiento de raíz' },
  { file: whatsapp('10.54.24'), caption: 'Área de hortalizas de la granja' },
  { file: whatsapp('10.54.25'), lotCode: 'AGR-2026-003', caption: 'Yuca: vista del lote' },
  { file: whatsapp('10.54.27'), lotCode: 'AGR-2026-003', caption: 'Yuca: vista del lote (2)' },
  { file: whatsapp('10.54.28'), lotCode: 'AGR-2026-003', caption: 'Yuca: surcos' },
  { file: whatsapp('10.54.29'), caption: 'Galpón avícola en funcionamiento' },
  { file: whatsapp('10.54.30'), caption: 'Galpón avícola en funcionamiento (2)' },
  { file: whatsapp('10.54.31'), lotCode: 'AGR-2026-003', caption: 'Yuca: lote cercado' },
  { file: whatsapp('10.54.32'), lotCode: 'AGR-2026-003', caption: 'Yuca: lote cercado (2)' },
]
