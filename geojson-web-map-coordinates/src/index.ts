import { Position, Geometry, BBox } from 'geojson'

const { isArray } = Array
const { min, max, pow, round } = Math
const MAX = Number.MAX_SAFE_INTEGER
const MIN = Number.MIN_SAFE_INTEGER

type SupportedGeometries = Geometry | Position[] | Position[][] | Position[][][]

/**
 * Changes geometry coordinates that we can show antimeridian exceeding lines on web maps.
 */
export default (geometry: SupportedGeometries) => applyWebMapCoordinates(geometry)

export const applyWebMapCoordinates = (geometry: SupportedGeometries, invert: boolean = false) => {
  const map = invert ? unWebMap : toWebMap

  if (!('type' in geometry)) {
    return !isArray(geometry[0][0])
      ? { type: 'LineString', coordinates: map(geometry as Position[]) }
      : !isArray(geometry[0][0][0])
      ? { type: isLineType(geometry as Position[][]) ? 'MultiLineString' : 'Polygon', coordinates: (geometry as Position[][]).map(map) }
      : { type: 'MultiPolygon', coordinates: (geometry as Position[][][]).map(coords => coords.map(map)) }
  }

  switch (geometry.type) {
    case 'LineString':
      geometry.coordinates = map(geometry.coordinates)
      break

    case 'Polygon':
    case 'MultiLineString':
      geometry.coordinates = geometry.coordinates.map(map)
      break

    case 'MultiPolygon':
      geometry.coordinates = geometry.coordinates.map(coords => coords.map(map))
      break

    case 'GeometryCollection':
      geometry.geometries = geometry.geometries.map(geometry => applyWebMapCoordinates(geometry, invert) as Geometry)
  }

  if (geometry.bbox) {
    geometry.bbox = bbox(geometry)
  }

  return geometry
}

// check if coordinates are not compatible to polygon rings
const isLineType = (coordinates: Position[][]) =>
  coordinates.reduce<boolean>((isLine, coords) => {
    if (isLine) return true

    const first = coords[0]
    const last = coords[coords.length - 1]

    return coords.length < 4 || first[0] !== last[0] || first[1] !== last[1]
  }, false)

// using longitudes above and below 180 and -180**
const toWebMap = (coordinates: Position[]): Position[] => {
  const line = coordinates.slice()

  for (let i = 1, mid = 0; i < line.length; i++) {
    const prev = line[i - 1][0]
    const lon = mid + line[i][0]
    const dec = declination(lon, prev)

    if (declination(lon + 360, prev) < dec) mid += 360
    if (declination(lon - 360, prev) < dec) mid -= 360
    if (mid !== 0) line[i] = [line[i][0] + mid, line[i][1]]
  }

  return line
}

// revert to longitudes between 180 and -180**
const unWebMap = (coordinates: Position[]): Position[] => {
  return coordinates.map(([lon, lat]) => [lon + 360 * round(lon / -360), lat])
}

// returns north/south or west/east declination
const declination = (a: number, b: number) => (a === b ? 0 : pow(a - b, 2))

// build a bbox ([min lon, min lat, max lon, max lat])
export const bbox = (array: any): BBox => {
  array = isArray(array) ? array : [array]
  array = array.map((coords: any) => (isArray(coords) || typeof coords !== 'object' ? coords : positionsFromGeometries([coords])))

  while (isArray(array[0][0])) {
    array = array.reduce((acc: [], arr: []) => [...acc, ...arr], [])
  }

  return ((isArray(array[0]) ? array : [array]) as Position[]).reduce<BBox>(
    ([nLon, nLat, xLon, xLat], [lon, lat]) => [min(nLon, lon), min(nLat, lat), max(xLon, lon), max(xLat, lat)],
    [MAX, MAX, MIN, MIN]
  )
}

const positionsFromGeometries = (geometries: Geometry[]): Position[] =>
  geometries.reduce<Position[]>((acc, geometry) => {
    if ('geometries' in geometry) return [...acc, ...positionsFromGeometries(geometry.geometries)]

    const arr = bbox(geometry.coordinates)
    return [...acc, arr.splice(0, 2), arr.splice(0, 2)]
  }, [])
