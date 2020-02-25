import { Position, Geometry } from 'geojson'

type SupportedGeometries = Geometry | Position[] | Position[][] | Position[][][]

/**
 * Applies the right hand rule to Polygons and Multi-Polygons in GeoJSON structs.
 * [RFC7946]{@link https://tools.ietf.org/html/rfc7946}
 **/
export default (geometry: SupportedGeometries) => applyRightHandRule(geometry)

export const applyRightHandRule = (geometry: SupportedGeometries, invert: boolean = false) => {
  if (!('type' in geometry)) {
    const { isArray } = Array

    return !isArray(geometry[0][0])
      ? { type: 'Polygon', coordinates: fixRings([geometry as Position[]], invert) }
      : !isArray(geometry[0][0][0])
      ? { type: 'Polygon', coordinates: fixRings(geometry as Position[][], invert) }
      : { type: 'MultiPolygon', coordinates: (geometry as Position[][][]).map(coords => fixRings(coords, invert)) }
  }

  if (geometry.type === 'Polygon') {
    geometry.coordinates = fixRings(geometry.coordinates)
  } else if (geometry.type === 'MultiPolygon') {
    geometry.coordinates = geometry.coordinates.map(coordinates => fixRings(coordinates, invert))
  } else if (geometry.type === 'GeometryCollection') {
    geometry.geometries = geometry.geometries.map(geometry => applyRightHandRule(geometry, invert) as Geometry)
  }

  return geometry
}

export const fixRings = (rings: Position[][], invert: boolean = false) =>
  rings.map((ring, i) => {
    const isCounterClockwise =
      (ring = enforceClosedRing(ring)).reduce((a, [x, y], i, r) => {
        // https://en.wikipedia.org/wiki/Shoelace_formula
        return i === r.length - 1 ? a : a + (r[i + 1][0] - x) * (r[i + 1][1] + y)
      }, 0) < 0

    return isCounterClockwise === (invert ? i !== 0 : i === 0) ? ring : ring.reverse()
  })

const enforceClosedRing = (ring: Position[]) => {
  const [firstLon, firstLat] = ring[0]
  const [lastLon, lastLat] = ring[ring.length - 1]

  return firstLon === lastLon && firstLat === lastLat ? ring.slice() : ring.concat([ring[0]])
}
