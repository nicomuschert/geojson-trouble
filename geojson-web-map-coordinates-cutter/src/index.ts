import { Position, BBox, Geometry, GeometryCollection } from 'geojson'
import { LineString, MultiLineString, Polygon, MultiPolygon, Point, MultiPoint } from 'geojson'

const { isArray } = Array
const { ceil, round, abs, min, max } = Math
const MAX = Number.MAX_SAFE_INTEGER
const MIN = Number.MIN_SAFE_INTEGER

type Primitive = LineString | MultiLineString | Polygon | Position | Position[] | Position[][] | Position[][][] | Point | MultiPoint

export interface InterpolatorFunction {
  (lon: number, a: Position, b: Position): Position[]
}

export interface IsHoleFunction {
  (hole: Position[], outerRing: Position[]): boolean
}

export default class Cutter {
  private applyCoordinateTranslation: boolean
  private interpolatorFn: InterpolatorFunction
  private isHoleFn: IsHoleFunction

  constructor(
    applyCoordinateTranslation: boolean = true,
    interpolatorFn: InterpolatorFunction = interpolate,
    isHoleFn: IsHoleFunction = isHole
  ) {
    this.applyCoordinateTranslation = applyCoordinateTranslation
    this.interpolatorFn = interpolatorFn
    this.isHoleFn = isHoleFn
  }

  cut(geometry: Primitive | MultiPolygon | GeometryCollection): Geometry {
    return isArray(geometry)
      ? this.cutPrimitive(geometry)
      : geometry.type === 'MultiPolygon'
      ? this.cutPrimitive(geometry.coordinates)
      : geometry.type === 'GeometryCollection'
      ? ({ type: 'GeometryCollection', geometries: geometry.geometries.map(g => this.cut(g)) } as GeometryCollection)
      : this.cutPrimitive(geometry)
  }

  private cutPrimitive(geometry: Primitive): Geometry {
    let type: 'LineString' | 'MultiLineString' | 'Polygon' | 'MultiPolygon' | 'Point' | 'MultiPoint'
    let coords: Position[][]

    if (!isArray(geometry)) {
      type = geometry.type
      coords =
        type === 'Point'
          ? [[geometry.coordinates as Position]]
          : type === 'LineString' || type === 'MultiPoint'
          ? [geometry.coordinates as Position[]]
          : (geometry.coordinates as Position[][])
    } else if (!isArray(geometry[0])) {
      type = 'Point'
      coords = [[geometry as Position]]
    } else if (!isArray(geometry[0][0])) {
      type = isLineType([geometry as Position[]]) ? 'LineString' : 'Polygon'
      coords = [geometry as Position[]]
    } else if (!isArray(geometry[0][0][0])) {
      type = isLineType(geometry as Position[][]) ? 'MultiLineString' : 'Polygon'
      coords = geometry as Position[][]
    } else {
      return {
        type: 'MultiPolygon',
        coordinates: (geometry as Position[][][]).reduce<Position[][][]>((condensed, coordinates) => {
          const geometry = this.cutPrimitive({ type: 'Polygon', coordinates }) as Polygon | MultiPolygon
          return [...condensed, ...(geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates)]
        }, [])
      }
    }

    const coordinates = this.cutRings(coords, type === 'Polygon')

    if (type === 'LineString') {
      if (coordinates[0].length === 1) return { type, coordinates: coordinates[0][0] }
      else type = 'MultiLineString'
    } else if (type === 'Polygon') {
      if (coordinates.length === 1) return { type, coordinates: coordinates[0] }
      else type = 'MultiPolygon'
    } else if (type === 'MultiPoint') {
      const points = coordinates[0].map<MultiPoint>(coordinates => ({ type: 'MultiPoint', coordinates }))
      return points.length === 1 ? points[0] : ({ type: 'GeometryCollection', geometries: points } as GeometryCollection)
    } else if (type === 'Point') {
      return { type: 'Point', coordinates: coordinates[0][0][0] }
    }

    return type === 'MultiLineString'
      ? { type, coordinates: coordinates.reduce((acc, lines) => [...acc, ...lines], []) }
      : { type, coordinates }
  }

  private cutRings(rings: Position[][], applyClosedRings: boolean): Position[][][] {
    const applyCoordinateTranslation = this.applyCoordinateTranslation
    const interpolate = this.interpolatorFn
    const isHole = this.isHoleFn

    const ringSlices: Position[][][] = rings.map(() => [])
    const ringShifts: number[][] = rings.map(() => [])

    for (let r = 0; r < rings.length; r++) {
      const ring = rings[r]
      const slices: Position[][] = ringSlices[r]
      const shifts: number[] = ringShifts[r]

      // initialize slice with first lon-lat pair
      let slice: Position[] = [ring[0].slice()]
      let sliceShift: number = shiftOf(slice[0][0])
      shifts.push(sliceShift)

      // loop the following lon-lat pairs
      for (let i = 1; i < ring.length; i++) {
        const [lon, lat] = ring[i]
        const shift = shiftOf(lon)

        // split at meridians using interpolation
        while (sliceShift !== shift) {
          const meridian = (shift > sliceShift ? -180 : 180) - sliceShift
          const connex = interpolate(meridian, slice[slice.length - 1], [lon, lat])

          slice.splice(slice.length, 0, ...connex)
          slices.push(slice)
          slice = [slice[slice.length - 1].slice()]
          shifts.push((sliceShift += shift > sliceShift ? 360 : -360))
        }

        slice.push([lon, lat])
      }

      if (slices.length === 0) {
        slices.push(slice)
      } else if (applyClosedRings) {
        // prepend rest coordinates to the initial slice
        slices[0].splice(0, 0, ...slice)
        shifts.pop()

        // find and filter holes
        for (let i = 0; i < slices.length; i++) {
          const slice = slices[i]
          const shift = shifts[i]

          for (let j = 1; j < slices.length; j++) {
            if (i !== j && shifts[j] === shift && isHole(slices[j], slice)) {
              const hole = slices[j]

              if (j <= i) i -= 1
              hole.push(hole[0].slice())
              shifts.splice(j, 1)
              slices.splice(j, 1)
              ringSlices.push([hole])
              ringShifts.push([shift])

              break
            }
          }
        }

        // close rings
        slicesL: for (let i = 0; i < slices.length; i++) {
          const slice = slices[i]
          const shift = shifts[i]
          const [lon1, lat1] = slice[0]
          const [lon2, lat2] = slice[slice.length - 1]

          if (lon1 !== lon2 || lat1 !== lat2 || slice.length < 4) {
            for (let j = i + 1; j < slices.length; j++) {
              if (shifts[j] !== shift) continue

              slice.splice(slice.length, 0, ...slices[j])
              shifts.splice(j, 1)
              slices.splice(j, 1)

              const [lon2, lat2] = slice[slice.length - 1]
              if (lon1 === lon2 && lat1 === lat2) continue slicesL
            }

            slice.push([lon1, lat1]) // force closing the ring
          }
        }
      } else if (slice.length > 1) {
        slices.push(slice) // finish the line string
      }

      // deduplicate consectuive coordinates
      for (let i = 0; i < slices.length; i++) {
        const slice = slices[i]
        let limit = slice.length - (applyClosedRings ? 4 : 3) // keep the polygon / line string valid
        slices[i] = slice.filter(([lon, lat], i) => !i || lon !== slice[i - 1][0] || lat !== slice[i - 1][1] || --limit < 0)
      }
    }

    // assign holes to the outer ring slices
    if (applyClosedRings && ringSlices[0]) {
      const holeShifts = ringShifts.splice(1)
      const holeSlices = ringSlices.splice(1)
      const slicesByShift = ringShifts[0]
        .filter((v, i, a) => a.indexOf(v) === i) // deduplicated shifts
        .reduce<{ [key: number]: Position[][][] }>((acc, shift) => {
          const holes = holeSlices.reduce((holes, slices, r) => [...holes, ...slices.filter((_, i) => holeShifts[r][i] === shift)], [])

          acc[shift] = ringSlices[0]
            .filter((_, i) => ringShifts[0][i] === shift)
            .map((ring, _, { length }) => {
              const rings = [ring]
              for (let i = 0; i < holes.length; i++) if (length === 1 || isHole(holes[i], ring)) rings.push(holes.splice(i--, 1)[0])
              return rings
            })

          return acc
        }, {})

      ringSlices.splice(0, 1, ...ringShifts[0].map(shift => slicesByShift[shift].splice(0, 1)[0]))
      ringShifts.splice(0, 1, ...ringShifts[0].map((shift, i) => ringSlices[i].map(_ => shift)))
    }

    if (applyCoordinateTranslation) {
      for (let r = 0; r < ringSlices.length; r++) {
        const slices = ringSlices[r]
        const shifts = ringShifts[r]

        // translate longitudes to the range between -180 and 180**
        for (let i = 0; i < slices.length; i++) {
          const shift = shifts[i]
          for (const coord of slices[i]) coord[0] += shift
        }

        // avoid duplicates due to translation
        ringSlices[r] = slices.filter((slice, i, slices) => {
          const sliceStr = slice.join()
          while (i && ++i < slices.length) if (slices[i].join() === sliceStr) return false
          return true
        })
      }
    }

    return ringSlices
  }
}

// returns the shift for a given longitude
const shiftOf = (lon: number) => {
  const factor = (360 * (lon / 360) - 180) / 360
  const base = ceil(factor)

  return (factor === base && base < 0 ? base + 1 : base) * -360
}

// interpolation with a single return position
// we forgoe accuracity because there are better libs to do this job
const interpolate: InterpolatorFunction = (lon: number, [lon1, lat1]: Position, [lon2, lat2]: Position): Position[] => {
  return [[lon, abs(lon1 - lon2) < 1e-9 ? lat1 : round((lat1 + ((lat2 - lat1) / (lon2 - lon1)) * (lon - lon1)) * 1e9) / 1e9]]
}

// check if coordinates are NOT compatible to polygon rings
const isLineType = (coordinates: Position[][]): boolean =>
  coordinates.reduce<boolean>((isLine, coords) => {
    if (isLine) return true

    const first = coords[0]
    const last = coords[coords.length - 1]

    return coords.length < 4 || first[0] !== last[0] || first[1] !== last[1]
  }, false)

// checks whether or not a slice can be used as donut-hole
// assume valid polygons without kinks - so compare boundaries should be enough
const isHole: IsHoleFunction = (hole: Position[], outerRing: Position[]) => {
  const [hLonMin, hLatMin, hLonMax, hLatMax] = bbox(hole)
  const [oLonMin, oLatMin, oLonMax, oLatMax] = bbox(outerRing)

  return hLonMin >= oLonMin && hLonMax <= oLonMax && hLatMin >= oLatMin && hLatMax <= oLatMax
}

// returns the bbox for a valid set of coordinates (min lon, min lat, max lon, max lat)
const bbox = (coordinates: Position[]): BBox =>
  coordinates.reduce<BBox>(([nn, nt, xn, xt], [n, t]) => [min(nn, n), min(nt, t), max(xn, n), max(xt, t)], [MAX, MAX, MIN, MIN])
