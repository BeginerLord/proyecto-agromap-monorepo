import type { GeoPoint } from '@/models'

/** GeoJSON usa [lng, lat]; Leaflet usa [lat, lng]. */
export const toLatLng = (point: GeoPoint): [number, number] => [point.coordinates[1], point.coordinates[0]]

export const toGeoPoint = (lat: number, lng: number): GeoPoint => ({
  type: 'Point',
  coordinates: [Number(lng.toFixed(6)), Number(lat.toFixed(6))],
})

export const formatCoords = (point: GeoPoint) => {
  const [lat, lng] = toLatLng(point)
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
}
