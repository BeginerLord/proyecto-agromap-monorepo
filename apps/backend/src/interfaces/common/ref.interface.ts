/** Referencias resumidas (documentos poblados) que se devuelven dentro de otras entidades. */
export interface UserRef {
  id: string
  name: string
}

export interface PlotRef {
  id: string
  name: string
}

export interface CropRef {
  id: string
  species: string
  variety?: string
}
