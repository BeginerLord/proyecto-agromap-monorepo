/**
 * Trazabilidad agrícola 2026 · Granja Avícola Doctora Pollo.
 * Generado a partir de «Agromap_Trazabilidad_Agricola_2026.xlsx» (hojas Datos Generales, Cultivos_Lotes,
 * Actividades, Cosechas, Cronograma_Referencia y Fuentes) y de la ficha «Distribución espacial y
 * organización territorial de la Granja Avícola Doctora Pollo».
 *
 * Las fechas son de calendario (YYYY-MM-DD). Solo la siembra (07/07/2026) y la primera cosecha de berenjena
 * (07/11/2026) son datos reales; las demás se estimaron con ciclos de referencia (ver `sources` de cada lote).
 */
import type { CropStatus, EvidenceType, FieldLogType, RecordStatus } from '../../constants/domain.js'

export const DATASET_NAME = 'Agromap_Trazabilidad_Agricola_2026'

/** Hoja «Datos Generales»: instrucciones y supuestos de la plantilla. */
export const GENERAL_NOTES: { topic: string; note: string }[] = [
  { topic: 'Objetivo', note: 'Plantilla para registrar la trazabilidad desde la siembra hasta cada cosecha de los cinco cultivos.' },
  { topic: 'Fecha base', note: 'Se tomó el 07/07/2026 como fecha de siembra de referencia para los cinco cultivos. Confirmar si todos se sembraron ese día.' },
  { topic: 'Fecha de corte', note: 'La información inicial llega al 07/11/2026; la primera cosecha de berenjena fue reportada para esa fecha.' },
  { topic: 'Cantidades iniciales', note: 'Berenjena 300; ají 200; yuca 300; pepino 100; habichuela 100. La unidad no fue especificada; se deja \'Por confirmar\'.' },
  { topic: 'Total inicial', note: '800 unidades solo si todas las cantidades corresponden a la misma unidad de medida.' },
  { topic: 'Datos reales vs estimados', note: 'Las fechas de siembra y la primera cosecha de berenjena proceden del usuario. Las demás fechas (etapas y cosechas) se estimaron con ciclos de referencia publicados para clima cálido (ver hoja Fuentes) y deben validarse con el agrónomo y las familias.' },
  { topic: 'Cómo alimentar', note: 'Agregar una fila en Actividades por cada labor o inspección. Agregar una fila en Cosechas por cada recolección, aunque sea del mismo lote.' },
  { topic: 'Identificadores', note: 'Los códigos AGR identifican lotes; ACT identifica actividades; COS identifica cosechas. Mantenerlos únicos.' },
  { topic: 'Campos por completar', note: 'Unidad de cantidad, variedad, ubicación/lote físico, responsable, cantidades cosechadas, peso, calidad, insumos, dosis, riego, destino y enlaces a fotos.' },
  { topic: 'Recomendación de base de datos', note: 'Usar codigo_lote como clave del lote y relacionar Actividades y Cosechas mediante codigo_lote. No sobrescribir cosechas anteriores: cada recolección es un registro independiente.' },
  { topic: 'Ciclos estimados', note: 'En Cultivos_Lotes, ciclo_estimado_dias = días desde la siembra hasta la primera cosecha; fecha_cosecha_estimada y fecha_fin_cosecha_estimada se calculan solas desde fecha_siembra.' },
  { topic: 'Supuesto de siembra', note: 'Se asumió que el 07/07/2026 fue siembra en semillero para berenjena y ají (trasplante ~35 días después), siembra directa para pepino y habichuela, y estacas para yuca. Corregir si fue distinto.' },
  { topic: 'Evidencia', note: 'Columna evidencia: Foto, Testimonio o Sin evidencia. Pepino y habichuela no tienen fotos: sus registros dicen "Reconstruido por testimonio de la familia, sin evidencia fotográfica".' },
]

/** Predio: coordenadas 8°55'22.58"N 75°36'48.59"W, área total 2 ha. */
export const FARM = {
  name: 'Granja Avícola Doctora Pollo',
  ownerName: 'Granja Avícola Doctora Pollo',
  municipality: 'Cereté',
  district: 'Granja Doctora Pollo',
  /** [lng, lat] */
  coordinates: [-75.613497, 8.922939] as [number, number],
  areaM2: 20000,
  landUseHistory:
    'Granja avícola con tres galpones (uno en funcionamiento), árboles frutales, cultivo de plátano, cultivos extensivos y un área de hortalizas.',
  /** Tabla 1 de la ficha de distribución espacial (área productiva: 3.572,84 m²). */
  units: [
    { name: 'Cultivo extensivo', areaM2: 1429.56, share: 40.0 },
    { name: 'Cultivo de plátano', areaM2: 1009.83, share: 28.3 },
    { name: 'Árboles frutales', areaM2: 531.74, share: 14.9 },
    { name: 'Cultivo extensivo 2', areaM2: 378.64, share: 10.6 },
    { name: 'Hortalizas', areaM2: 223.07, share: 6.2 },
  ],
}

export interface SeedSource {
  data: string
  source: string
  url: string
}

export interface SeedMilestone {
  period: string
  startDate?: string
  endDate?: string
  milestone: string
  requiredRecord: string
  infoType: string
}

/** Hoja «Cronograma_Referencia». `crop: 'Todos'` aplica a los cinco lotes. */
export const REFERENCE_SCHEDULE: (SeedMilestone & { crop: string })[] = [
  {
    crop: 'Todos',
    period: '2026-07-07',
    startDate: '2026-07-07',
    milestone: 'Siembra de referencia',
    requiredRecord: 'Fecha de inicio indicada para los cultivos.',
    infoType: 'Dato suministrado',
  },
  {
    crop: 'Todos',
    period: 'Julio 2026',
    milestone: 'Germinación y establecimiento',
    requiredRecord: 'Registrar emergencia, prendimiento, resiembras y mortalidad.',
    infoType: 'Etapa sugerida; verificar',
  },
  {
    crop: 'Todos',
    period: 'Agosto 2026',
    milestone: 'Crecimiento vegetativo',
    requiredRecord: 'Registrar riego, fertilización, malezas, plagas y enfermedades.',
    infoType: 'Etapa sugerida; verificar',
  },
  {
    crop: 'Todos',
    period: 'Septiembre 2026',
    milestone: 'Desarrollo y floración',
    requiredRecord: 'Registrar floración, vigor y sanidad del cultivo.',
    infoType: 'Etapa sugerida; verificar',
  },
  {
    crop: 'Todos',
    period: 'Octubre 2026',
    milestone: 'Fructificación / evaluación',
    requiredRecord: 'Registrar frutos, calidad y estimación de cosecha.',
    infoType: 'Etapa sugerida; verificar',
  },
  {
    crop: 'Berenjena',
    period: '2026-11-07',
    startDate: '2026-11-07',
    milestone: 'Primera cosecha reportada',
    requiredRecord: 'Registrar peso, unidades, calidad, destino y responsable.',
    infoType: 'Dato suministrado; completar detalle',
  },
  {
    crop: 'Pepino',
    period: '2026-08-26 a 2026-10-05',
    startDate: '2026-08-26',
    endDate: '2026-10-05',
    milestone: 'Ventana estimada de cosecha',
    requiredRecord: 'Registrar cada recolección recordada por la familia.',
    infoType: 'Estimado por ciclo; Reconstruido por testimonio de la familia, sin evidencia fotográfica',
  },
  {
    crop: 'Habichuela',
    period: '2026-09-05 a 2026-10-05',
    startDate: '2026-09-05',
    endDate: '2026-10-05',
    milestone: 'Ventana estimada de cosecha',
    requiredRecord: 'Registrar cada recolección recordada por la familia.',
    infoType: 'Estimado por ciclo; Reconstruido por testimonio de la familia, sin evidencia fotográfica',
  },
  {
    crop: 'Ají',
    period: '2026-10-15 a 2027-03-04',
    startDate: '2026-10-15',
    endDate: '2027-03-04',
    milestone: 'Ventana estimada de cosecha (escalonada)',
    requiredRecord: 'Confirmar fecha real de primera cosecha con la foto.',
    infoType: 'Estimado por ciclo de referencia',
  },
  {
    crop: 'Berenjena',
    period: '2026-11-07 a 2027-01-23',
    startDate: '2026-11-07',
    endDate: '2027-01-23',
    milestone: 'Ventana estimada de cosecha (escalonada)',
    requiredRecord: 'Registrar cada recolección con peso, calidad y destino.',
    infoType: 'Inicio real; fin estimado',
  },
  {
    crop: 'Yuca',
    period: '2027-02-02 a 2027-06-02',
    startDate: '2027-02-02',
    endDate: '2027-06-02',
    milestone: 'Ventana estimada de cosecha',
    requiredRecord: 'Validar madurez con el agrónomo (7–11 meses según variedad).',
    infoType: 'Estimado por ciclo; el dato inicial de 6 meses parece corto',
  },
]

export interface SeedLot {
  lotCode: string
  species: string
  status: CropStatus
  plantedAt: string
  initialQuantity: number
  quantityUnit: string
  variety?: string
  firstHarvestAt?: string
  expectedHarvestAt: string
  cycleDays: number
  harvestEndAt: string
  harvestEndDays: number
  statusNote: string
  notes: string
  cycleReference: string
  sowingMethod: string
  evidence: EvidenceType
  sourcesLabel: string
  sources: SeedSource[]
}

/** Hoja «Cultivos_Lotes» + hoja «Fuentes» agrupada por cultivo. */
export const LOTS: SeedLot[] = [
  {
    lotCode: 'AGR-2026-001',
    species: 'Berenjena',
    status: 'harvesting',
    plantedAt: '2026-07-07',
    initialQuantity: 300,
    quantityUnit: 'Por confirmar',
    firstHarvestAt: '2026-11-07',
    expectedHarvestAt: '2026-11-07',
    cycleDays: 123,
    harvestEndAt: '2027-01-23',
    harvestEndDays: 200,
    statusNote: 'En cosecha',
    notes:
      'Primera cosecha real el 07/11/2026 (123 días desde el 07/07, coherente con semillero + trasplante). Cosecha escalonada; fin estimado orientativo. Registrar cada recolección por separado.',
    cycleReference: '60–100 días desde el trasplante; semillero de 4–6 semanas',
    sowingMethod: 'Semillero + trasplante',
    evidence: 'photo',
    sourcesLabel: 'Wikifarmer (berenjena); Agronomía Colombiana – Corpoica Turipaná',
    sources: [
      {
        data: '60–100 días desde trasplante hasta cosecha; trasplante a las 4–6 semanas',
        source: 'Wikifarmer – Cultivo de berenjenas',
        url: 'https://wikifarmer.com/es/cultivo-de-berenjenas-al-aire-libre-con-fines-de-lucro-guia-de-crecimiento-completa-de-principio-a-fin/',
      },
      {
        data: 'Ciclo de 138 días en genotipos Morada y Lila (Córdoba)',
        source: 'Agronomía Colombiana – Corpoica Turipaná, Cereté',
        url: 'https://revistas.unal.edu.co/index.php/agrocol/article/download/17757/18583/56868',
      },
    ],
  },
  {
    lotCode: 'AGR-2026-002',
    species: 'Ají',
    status: 'harvesting',
    plantedAt: '2026-07-07',
    initialQuantity: 200,
    quantityUnit: 'Por confirmar',
    expectedHarvestAt: '2026-10-15',
    cycleDays: 100,
    harvestEndAt: '2027-03-04',
    harvestEndDays: 240,
    statusNote: 'En cosecha (estimado desde mediados de octubre)',
    notes:
      'Primera cosecha estimada a 100 días. El ají dulce del Caribe tiene ciclo vegetativo corto y producción prolongada (varios meses). Confirmar fecha real con las fotos.',
    cycleReference: '90–120 días a primera cosecha; producción escalonada de varios meses',
    sowingMethod: 'Semillero + trasplante',
    evidence: 'photo',
    sourcesLabel: 'Revista Agronomía Mesoamericana (ají dulce topito, Caribe); Finagro (ají topito)',
    sources: [
      {
        data: 'Ají dulce topito: ciclo vegetativo corto y ciclo productivo prolongado (Caribe colombiano)',
        source: 'Agronomía Mesoamericana',
        url: 'https://revistas.ucr.ac.cr/index.php/ragromeso/article/download/3974/4346/18750',
      },
      {
        data: 'Parámetros técnicos de ají topito',
        source: 'Finagro – Ají topito',
        url: 'https://test.finagro.com.co/sites/default/files/2022-05/aji_topito_norte_de_santander.pdf',
      },
    ],
  },
  {
    lotCode: 'AGR-2026-003',
    species: 'Yuca',
    status: 'growing',
    plantedAt: '2026-07-07',
    initialQuantity: 300,
    quantityUnit: 'Por confirmar',
    expectedHarvestAt: '2027-02-02',
    cycleDays: 210,
    harvestEndAt: '2027-06-02',
    harvestEndDays: 330,
    statusNote: 'En desarrollo (engrosamiento de raíz)',
    notes:
      'El dato del usuario era 6 meses (07/01/2027); las fuentes indican 7–11 meses para Córdoba/Caribe, por lo que la cosecha se estima entre feb. y jun. de 2027. Validar variedad y madurez con el agrónomo.',
    cycleReference: '7–9 meses (variedades del Caribe); 8–11 meses en promedio',
    sowingMethod: 'Estacas',
    evidence: 'photo',
    sourcesLabel: 'DANE (censo yuca); FAO (yuca); Agronegocios (variedades Caribe)',
    sources: [
      {
        data: 'Cosecha entre 8 y 11 meses después de la siembra',
        source: 'DANE – Censo de yuca industrial',
        url: 'https://www.dane.gov.co/files/investigaciones/agropecuario/enda/ena/censo_yuca_industrial.pdf',
      },
      {
        data: 'Ciclo de 7 a 12 meses en zonas cálidas',
        source: 'FAO – Yuca',
        url: 'https://fao.org/docrep/pdf/010/a1028s/a1028s01.pdf',
      },
      {
        data: 'Variedades del Caribe con ciclo de 7 a 9 meses',
        source: 'Agronegocios – Nuevas variedades de yuca',
        url: 'https://www.agronegocios.co/agricultura/surgen-nuevas-variedades-de-yuca-atractivas-en-el-comercio-2621171',
      },
    ],
  },
  {
    lotCode: 'AGR-2026-004',
    species: 'Pepino',
    status: 'finished',
    plantedAt: '2026-07-07',
    initialQuantity: 100,
    quantityUnit: 'Por confirmar',
    expectedHarvestAt: '2026-08-26',
    cycleDays: 50,
    harvestEndAt: '2026-10-05',
    harvestEndDays: 90,
    statusNote: 'Ciclo terminado (estimado)',
    notes:
      'Cosechas estimadas por ciclo de referencia. Reconstruido por testimonio de la familia, sin evidencia fotográfica.',
    cycleReference: 'Cosecha desde ~50 días; ciclo total 60–90 días',
    sowingMethod: 'Siembra directa',
    evidence: 'testimony',
    sourcesLabel: 'JICA (guía de pepino); Finagro (pepino)',
    sources: [
      {
        data: 'Cosecha a los ~50 días; ciclo de siembra directa 60–75 días',
        source: 'JICA – Guía de pepino',
        url: 'https://www.jica.go.jp/project/panama/0603268/materials/pdf/02_gardening/02_Pepino.pdf',
      },
      {
        data: 'Inicio de producción a los 50 días; ciclo de 3,5 meses',
        source: 'Finagro – Pepino',
        url: 'https://www.finagro.com.co/sites/default/files/2022-05/pepino_humocaro_bajo_invernadero.pdf',
      },
    ],
  },
  {
    lotCode: 'AGR-2026-005',
    species: 'Habichuela',
    status: 'finished',
    plantedAt: '2026-07-07',
    initialQuantity: 100,
    quantityUnit: 'Por confirmar',
    expectedHarvestAt: '2026-09-05',
    cycleDays: 60,
    harvestEndAt: '2026-10-05',
    harvestEndDays: 90,
    statusNote: 'Ciclo terminado (estimado)',
    notes:
      'Cosechas estimadas por ciclo de referencia. Reconstruido por testimonio de la familia, sin evidencia fotográfica.',
    cycleReference: 'Ciclo corto de ~60 días a cosecha de vaina verde; 3–4 semanas de recolección',
    sowingMethod: 'Siembra directa',
    evidence: 'testimony',
    sourcesLabel: 'Univ. de Puerto Rico (producción de habichuelas); Finagro (habichuela)',
    sources: [
      {
        data: 'Habichuela verde: ciclo corto de alrededor de 60 días',
        source: 'Universidad de Puerto Rico – Producción de habichuelas',
        url: 'https://www.uprm.edu/sea/wp-content/uploads/sites/351/2025/03/Produccio%CC%81n-de-habichuelas_FINAL.pdf',
      },
      {
        data: 'Parámetros técnicos de habichuela Blue Lake',
        source: 'Finagro – Habichuela',
        url: 'https://www.finagro.com.co/sites/default/files/2022-05/habichuela_blue_lake_nortedesantander.pdf',
      },
    ],
  },
]

export interface SeedActivity {
  code: string
  lotCode: string
  date: string
  type: FieldLogType
  activity: string
  detail: string
  dataOrigin: string
  estimated: boolean
  recordStatus: RecordStatus
  evidence: EvidenceType
  photoUrl?: string
}

/** Hoja «Actividades» (una fila por labor o inspección). */
export const ACTIVITIES: SeedActivity[] = [
  {
    code: 'ACT-001',
    lotCode: 'AGR-2026-001',
    date: '2026-07-07',
    type: 'sowing',
    activity: 'Preparación del terreno y siembra',
    detail: 'Registrar preparación, ubicación, variedad, cantidad sembrada y responsable.',
    dataOrigin: 'Fecha de referencia suministrada; detalles por completar',
    estimated: false,
    recordStatus: 'pending',
    evidence: 'photo',
  },
  {
    code: 'ACT-002',
    lotCode: 'AGR-2026-002',
    date: '2026-07-07',
    type: 'sowing',
    activity: 'Preparación del terreno y siembra',
    detail: 'Registrar preparación, ubicación, variedad, cantidad sembrada y responsable.',
    dataOrigin: 'Fecha de referencia suministrada; detalles por completar',
    estimated: false,
    recordStatus: 'pending',
    evidence: 'photo',
  },
  {
    code: 'ACT-003',
    lotCode: 'AGR-2026-003',
    date: '2026-07-07',
    type: 'sowing',
    activity: 'Preparación del terreno y siembra',
    detail: 'Registrar preparación, variedad, cantidad de estacas y responsable.',
    dataOrigin: 'Fecha de referencia suministrada; detalles por completar',
    estimated: false,
    recordStatus: 'pending',
    evidence: 'photo',
  },
  {
    code: 'ACT-004',
    lotCode: 'AGR-2026-004',
    date: '2026-07-07',
    type: 'sowing',
    activity: 'Preparación del terreno y siembra',
    detail: 'Registrar preparación, variedad, cantidad sembrada y responsable.',
    dataOrigin: 'Fecha de referencia suministrada; detalles por completar; Reconstruido por testimonio de la familia, sin evidencia fotográfica',
    estimated: false,
    recordStatus: 'pending',
    evidence: 'testimony',
  },
  {
    code: 'ACT-005',
    lotCode: 'AGR-2026-005',
    date: '2026-07-07',
    type: 'sowing',
    activity: 'Preparación del terreno y siembra',
    detail: 'Registrar preparación, variedad, cantidad sembrada y responsable.',
    dataOrigin: 'Fecha de referencia suministrada; detalles por completar; Reconstruido por testimonio de la familia, sin evidencia fotográfica',
    estimated: false,
    recordStatus: 'pending',
    evidence: 'testimony',
  },
  {
    code: 'ACT-006',
    lotCode: 'AGR-2026-004',
    date: '2026-07-13',
    type: 'observation',
    activity: 'Germinación',
    detail: 'Registrar porcentaje de emergencia, resiembras y novedades.',
    dataOrigin: 'Estimado por ciclo de referencia (ver hoja Fuentes); Reconstruido por testimonio de la familia, sin evidencia fotográfica',
    estimated: true,
    recordStatus: 'to_verify',
    evidence: 'testimony',
  },
  {
    code: 'ACT-007',
    lotCode: 'AGR-2026-005',
    date: '2026-07-14',
    type: 'observation',
    activity: 'Germinación',
    detail: 'Registrar porcentaje de emergencia, resiembras y novedades.',
    dataOrigin: 'Estimado por ciclo de referencia (ver hoja Fuentes); Reconstruido por testimonio de la familia, sin evidencia fotográfica',
    estimated: true,
    recordStatus: 'to_verify',
    evidence: 'testimony',
  },
  {
    code: 'ACT-008',
    lotCode: 'AGR-2026-003',
    date: '2026-07-22',
    type: 'observation',
    activity: 'Brotación de estacas',
    detail: 'Registrar prendimiento, estacas fallidas y resiembras.',
    dataOrigin: 'Estimado por ciclo de referencia (ver hoja Fuentes)',
    estimated: true,
    recordStatus: 'to_verify',
    evidence: 'photo',
  },
  {
    code: 'ACT-009',
    lotCode: 'AGR-2026-004',
    date: '2026-08-06',
    type: 'observation',
    activity: 'Floración',
    detail: 'Registrar inicio de floración, tutorado, riego y manejo fitosanitario.',
    dataOrigin: 'Estimado por ciclo de referencia (ver hoja Fuentes); Reconstruido por testimonio de la familia, sin evidencia fotográfica',
    estimated: true,
    recordStatus: 'to_verify',
    evidence: 'testimony',
  },
  {
    code: 'ACT-010',
    lotCode: 'AGR-2026-001',
    date: '2026-08-11',
    type: 'sowing',
    activity: 'Trasplante a campo',
    detail: 'Registrar fecha real de trasplante, número de plantas y distancia de siembra.',
    dataOrigin: 'Estimado por ciclo de referencia (ver hoja Fuentes)',
    estimated: true,
    recordStatus: 'to_verify',
    evidence: 'photo',
  },
  {
    code: 'ACT-011',
    lotCode: 'AGR-2026-002',
    date: '2026-08-11',
    type: 'sowing',
    activity: 'Trasplante a campo',
    detail: 'Registrar fecha real de trasplante, número de plantas y distancia de siembra.',
    dataOrigin: 'Estimado por ciclo de referencia (ver hoja Fuentes)',
    estimated: true,
    recordStatus: 'to_verify',
    evidence: 'photo',
  },
  {
    code: 'ACT-012',
    lotCode: 'AGR-2026-005',
    date: '2026-08-11',
    type: 'observation',
    activity: 'Floración',
    detail: 'Registrar inicio de floración, riego y manejo fitosanitario.',
    dataOrigin: 'Estimado por ciclo de referencia (ver hoja Fuentes); Reconstruido por testimonio de la familia, sin evidencia fotográfica',
    estimated: true,
    recordStatus: 'to_verify',
    evidence: 'testimony',
  },
  {
    code: 'ACT-013',
    lotCode: 'AGR-2026-004',
    date: '2026-08-26',
    type: 'harvest',
    activity: 'Primera cosecha (estimada)',
    detail: 'Registrar cantidad, peso, calidad y destino si la familia lo recuerda.',
    dataOrigin: 'Estimado por ciclo de referencia (ver hoja Fuentes); Reconstruido por testimonio de la familia, sin evidencia fotográfica',
    estimated: true,
    recordStatus: 'to_verify',
    evidence: 'testimony',
  },
  {
    code: 'ACT-014',
    lotCode: 'AGR-2026-005',
    date: '2026-09-05',
    type: 'harvest',
    activity: 'Primera cosecha (estimada)',
    detail: 'Registrar cantidad, peso, calidad y destino si la familia lo recuerda.',
    dataOrigin: 'Estimado por ciclo de referencia (ver hoja Fuentes); Reconstruido por testimonio de la familia, sin evidencia fotográfica',
    estimated: true,
    recordStatus: 'to_verify',
    evidence: 'testimony',
  },
  {
    code: 'ACT-015',
    lotCode: 'AGR-2026-002',
    date: '2026-09-15',
    type: 'observation',
    activity: 'Floración',
    detail: 'Registrar inicio de floración, vigor y sanidad.',
    dataOrigin: 'Estimado por ciclo de referencia (ver hoja Fuentes)',
    estimated: true,
    recordStatus: 'to_verify',
    evidence: 'photo',
  },
  {
    code: 'ACT-016',
    lotCode: 'AGR-2026-001',
    date: '2026-09-25',
    type: 'observation',
    activity: 'Floración',
    detail: 'Registrar inicio de floración, vigor y sanidad.',
    dataOrigin: 'Estimado por ciclo de referencia (ver hoja Fuentes)',
    estimated: true,
    recordStatus: 'to_verify',
    evidence: 'photo',
  },
  {
    code: 'ACT-017',
    lotCode: 'AGR-2026-003',
    date: '2026-10-05',
    type: 'observation',
    activity: 'Inicio de engrosamiento de raíz',
    detail: 'Registrar vigor, sanidad, control de malezas y fertilización.',
    dataOrigin: 'Estimado por ciclo de referencia (ver hoja Fuentes)',
    estimated: true,
    recordStatus: 'to_verify',
    evidence: 'photo',
  },
  {
    code: 'ACT-018',
    lotCode: 'AGR-2026-004',
    date: '2026-10-05',
    type: 'harvest',
    activity: 'Fin de cosecha (estimado)',
    detail: 'Registrar última recolección y retiro del cultivo.',
    dataOrigin: 'Estimado por ciclo de referencia (ver hoja Fuentes); Reconstruido por testimonio de la familia, sin evidencia fotográfica',
    estimated: true,
    recordStatus: 'to_verify',
    evidence: 'testimony',
  },
  {
    code: 'ACT-019',
    lotCode: 'AGR-2026-005',
    date: '2026-10-05',
    type: 'harvest',
    activity: 'Fin de cosecha (estimado)',
    detail: 'Registrar última recolección y retiro del cultivo.',
    dataOrigin: 'Estimado por ciclo de referencia (ver hoja Fuentes); Reconstruido por testimonio de la familia, sin evidencia fotográfica',
    estimated: true,
    recordStatus: 'to_verify',
    evidence: 'testimony',
  },
  {
    code: 'ACT-020',
    lotCode: 'AGR-2026-002',
    date: '2026-10-15',
    type: 'harvest',
    activity: 'Primera cosecha (estimada)',
    detail: 'Registrar cantidad, peso, calidad y destino; confirmar fecha con la foto.',
    dataOrigin: 'Estimado por ciclo de referencia (ver hoja Fuentes)',
    estimated: true,
    recordStatus: 'to_verify',
    evidence: 'photo',
  },
  {
    code: 'ACT-021',
    lotCode: 'AGR-2026-001',
    date: '2026-11-07',
    type: 'harvest',
    activity: 'Primera cosecha reportada',
    detail: 'Registrar cantidad, peso, calidad, destino, pérdidas y responsable de cosecha.',
    dataOrigin: 'Fecha real informada; cantidades cosechadas por completar',
    estimated: false,
    recordStatus: 'pending',
    evidence: 'photo',
  },
]

export interface SeedHarvest {
  code: string
  lotCode: string
  date: string
  harvestType: string
  quantity?: number
  quantityUnit?: string
  weightKg?: number
  quality?: string
  marketableQuantity?: number
  lostQuantity?: number
  notes: string
  dataOrigin: string
  estimated: boolean
  evidence: EvidenceType
  photoUrl?: string
}

/** Hoja «Cosechas» (cada recolección es un registro independiente). Cantidades aún sin diligenciar. */
export const HARVESTS: SeedHarvest[] = [
  {
    code: 'COS-2026-001',
    lotCode: 'AGR-2026-001',
    date: '2026-11-07',
    harvestType: 'Primera cosecha',
    notes: 'Fecha real reportada; completar cantidades, peso, calidad y destino.',
    dataOrigin: 'Fecha real reportada por el usuario',
    estimated: false,
    evidence: 'photo',
  },
  {
    code: 'COS-2026-002',
    lotCode: 'AGR-2026-004',
    date: '2026-08-26',
    harvestType: 'Primera cosecha (estimada)',
    notes: 'Fecha estimada a 50 días de la siembra. Completar cantidades si la familia las recuerda.',
    dataOrigin: 'Reconstruido por testimonio de la familia, sin evidencia fotográfica',
    estimated: true,
    evidence: 'testimony',
  },
  {
    code: 'COS-2026-003',
    lotCode: 'AGR-2026-005',
    date: '2026-09-05',
    harvestType: 'Primera cosecha (estimada)',
    notes: 'Fecha estimada a 60 días de la siembra. Completar cantidades si la familia las recuerda.',
    dataOrigin: 'Reconstruido por testimonio de la familia, sin evidencia fotográfica',
    estimated: true,
    evidence: 'testimony',
  },
  {
    code: 'COS-2026-004',
    lotCode: 'AGR-2026-002',
    date: '2026-10-15',
    harvestType: 'Primera cosecha (estimada)',
    notes: 'Fecha estimada a 100 días. Ajustar con la fecha de la foto y completar cantidades.',
    dataOrigin: 'Estimado por ciclo de referencia; confirmar con foto',
    estimated: true,
    evidence: 'photo',
  },
]
