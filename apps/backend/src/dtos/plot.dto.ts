import Type, { type Static } from 'typebox'
import { PLOT_STATUS, SUN_EXPOSURE, WATER_ACCESS } from '../constants/domain.js'
import { Paginated, PaginationQueryDto, StringEnum, TimestampsDto, UserRefDto } from './common.dto.js'

export const GeoPointDto = Type.Object(
  {
    type: Type.Literal('Point'),
    coordinates: Type.Tuple([
      Type.Number({ minimum: -180, maximum: 180, description: 'Longitud' }),
      Type.Number({ minimum: -90, maximum: 90, description: 'Latitud' }),
    ]),
  },
  { description: 'GeoJSON Point [longitud, latitud]' },
)

export const GeoPolygonDto = Type.Object(
  {
    type: Type.Literal('Polygon'),
    coordinates: Type.Array(Type.Array(Type.Array(Type.Number(), { minItems: 2, maxItems: 2 }), { minItems: 4 })),
  },
  { description: 'GeoJSON Polygon (linderos del predio)' },
)

const OwnerDto = Type.Object({
  name: Type.String({ minLength: 2, maxLength: 120 }),
  phone: Type.Optional(Type.String({ maxLength: 30 })),
})

const LocationDto = Type.Object({
  municipality: Type.String({ minLength: 2, maxLength: 80, default: 'Cereté' }),
  district: Type.String({ minLength: 2, maxLength: 80, description: 'Corregimiento' }),
  address: Type.Optional(Type.String({ maxLength: 200 })),
  point: GeoPointDto,
})

const CharacterizationDto = Type.Object({
  soilType: Type.Optional(Type.String({ maxLength: 80 })),
  waterAccess: Type.Optional(StringEnum(WATER_ACCESS)),
  sunExposure: Type.Optional(StringEnum(SUN_EXPOSURE)),
  landUseHistory: Type.Optional(Type.String({ maxLength: 500 })),
  notes: Type.Optional(Type.String({ maxLength: 1000 })),
})

export const CreatePlotDto = Type.Object(
  {
    name: Type.String({ minLength: 2, maxLength: 120 }),
    owner: OwnerDto,
    location: LocationDto,
    boundary: Type.Optional(GeoPolygonDto),
    areaM2: Type.Optional(Type.Number({ minimum: 0 })),
    characterization: Type.Optional(CharacterizationDto),
    status: Type.Optional(StringEnum(PLOT_STATUS)),
  },
  { additionalProperties: false },
)
export type CreatePlotDto = Static<typeof CreatePlotDto>

export const UpdatePlotDto = Type.Partial(CreatePlotDto, { additionalProperties: false, minProperties: 1 })
export type UpdatePlotDto = Static<typeof UpdatePlotDto>

export const PlotQueryDto = Type.Object({
  ...PaginationQueryDto.properties,
  district: Type.Optional(Type.String()),
  status: Type.Optional(StringEnum(PLOT_STATUS)),
})
export type PlotQueryDto = Static<typeof PlotQueryDto>

export const PlotResponseDto = Type.Object({
  id: Type.String(),
  name: Type.String(),
  owner: OwnerDto,
  location: LocationDto,
  boundary: Type.Optional(GeoPolygonDto),
  areaM2: Type.Optional(Type.Number()),
  characterization: CharacterizationDto,
  status: StringEnum(PLOT_STATUS),
  createdBy: Type.Optional(UserRefDto),
  ...TimestampsDto,
})

export const PlotListResponseDto = Paginated(PlotResponseDto)
