export interface ProjectVideo {
  id: string
  title: string
  description: string
  /** Ruta servida por la API desde Backblaze B2. Sin ella el video aparece como "Próximamente". */
  src?: string
}

/**
 * Videos del sitio público (4 en total). Se suben con `pnpm --filter @agromap/backend upload-video`
 * a <prefijo>videos/<nombre>.mp4; para publicar uno nuevo basta con añadir su `src` aquí.
 */
export const PROJECT_VIDEOS: ProjectVideo[] = [
  {
    id: 'resultado-final',
    title: 'Resultado final del proyecto',
    description: 'El recorrido completo de AgroMap-Cereté: los cultivos, las jornadas de apoyo y lo que logramos.',
    src: '/uploads/agromap/videos/resultado-final.mp4',
  },
  { id: 'video-2', title: 'Video 2', description: 'Muy pronto publicaremos este video.' },
  { id: 'video-3', title: 'Video 3', description: 'Muy pronto publicaremos este video.' },
  { id: 'video-4', title: 'Video 4', description: 'Muy pronto publicaremos este video.' },
]
