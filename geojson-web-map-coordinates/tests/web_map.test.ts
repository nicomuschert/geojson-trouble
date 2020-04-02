import { Position, LineString, Polygon, MultiPolygon, GeometryCollection } from 'geojson'
import { applyWebMapCoordinates } from '../src'

describe('general expectations', () => {
  it('does not modify input', () => {
    const input: Position[] = [[-170, 0], [165, 0]]
    const output: LineString = applyWebMapCoordinates(input) as LineString

    expect(output.coordinates === input).toBeFalse()
    expect(input).toEqual([[-170, 0], [165, 0]])
  })
})

describe('bounding boxes on geometry objects', () => {
  const coordinates = [[-170, 1], [-195, 2], [-170, 3], [-160, 4], [-195, 5]]

  it('does not add bboxes', () => {
    const input: LineString = { type: 'LineString', coordinates }
    const output: LineString = applyWebMapCoordinates(input) as LineString

    expect(output.bbox).toBe(undefined)
  })

  it('updates bboxes', () => {
    const input: LineString = { type: 'LineString', bbox: [0, 0, 0, 0], coordinates }
    const output: LineString = applyWebMapCoordinates(input) as LineString

    expect(output.bbox).toEqual([-195, 1, -160, 5])
  })
})

describe('LineString', () => {
  it('will be created from coordinates', () => {
    const expected = { type: 'LineString', coordinates: [[-170, 0], [5, 0]] }
    expect(applyWebMapCoordinates(expected.coordinates)).toEqual(expected)
  })

  it('hops across the antimeridian', () => {
    const expected = { type: 'LineString', coordinates: [[-170, 0], [-195, 0]] }
    expect(applyWebMapCoordinates([[-170, 0], [165, 0]])).toEqual(expected)
  })

  it('hops across the antimeridian fourth and back', () => {
    const expected = { type: 'LineString', coordinates: [[-170, 0], [-195, 0], [-170, 5], [-160, 10], [-195, 15]] }
    expect(applyWebMapCoordinates([[-170, 0], [165, 0], [-170, 5], [-160, 10], [165, 15]])).toEqual(expected)
  })

  it('hops across 180/-180 meridians multiple times (clockwise)', () => {
    let input = [[-179, -27], [154, -27], [178, -17], [-135, -17], [-74, -37], [-34, -7], [11, -16]]
    input = [...input, [41, -14], [113, -24], [153, -24], [178, -37], [-146, -26], [-111, 23]]
    input = [...input, [-60, 23], [-10, 35], [40, 35], [113, -23], [-82, -5], [-47, 61]]

    let expected = [[-179, -27], [-206, -27], [-182, -17], [-135, -17], [-74, -37], [-34, -7], [11, -16], [41, -14]]
    expected = [...expected, [113, -24], [153, -24], [178, -37], [214, -26], [249, 23], [300, 23], [350, 35], [400, 35]]
    expected = [...expected, [473, -23], [638, -5], [673, 61]]

    expect(applyWebMapCoordinates(input)).toEqual({ type: 'LineString', coordinates: expected })
  })

  it('hops across 180/-180 meridians multiple times (counter clockwise)', () => {
    let input = [[-47, 61], [-82, -5], [113, -23], [40, 35], [-10, 35], [-60, 23], [-111, 23]]
    input = [...input, [-146, -26], [178, -37], [153, -24], [113, -24], [41, -14], [11, -16]]
    input = [...input, [-34, -7], [-74, -37], [-135, -17], [178, -17], [154, -27], [-179, -27]]

    let expected = [[-47, 61], [-82, -5], [-247, -23], [-320, 35], [-370, 35], [-420, 23], [-471, 23], [-506, -26]]
    expected = [...expected, [-542, -37], [-567, -24], [-607, -24], [-679, -14], [-709, -16], [-754, -7], [-794, -37]]
    expected = [...expected, [-855, -17], [-902, -17], [-926, -27], [-899, -27]]

    expect(applyWebMapCoordinates(input)).toEqual({ type: 'LineString', coordinates: expected })
  })
})

describe('geometry types', () => {
  it('applies to Polygon', () => {
    const coordinates = [[[-170, 0], [5, 10], [-170, 0]]]
    const input: Polygon = { type: 'Polygon', coordinates }
    const output: Polygon = applyWebMapCoordinates(input) as Polygon

    expect(output.coordinates).toEqual(coordinates)
  })

  it('applies to MultiPolygon', () => {
    const coordinates = [[[[-170, 0], [5, 10], [-170, 0]]]]
    const input: MultiPolygon = { type: 'MultiPolygon', coordinates }
    const output: MultiPolygon = applyWebMapCoordinates(input) as MultiPolygon

    expect(output.coordinates).toEqual(coordinates)
  })

  it('applies to GeometryCollection', () => {
    const input: GeometryCollection = {
      type: 'GeometryCollection',
      geometries: [{ type: 'LineString', coordinates: [[-170, 0], [165, 0]] }]
    }

    expect(applyWebMapCoordinates(input)).toEqual({
      type: 'GeometryCollection',
      geometries: [{ type: 'LineString', coordinates: [[-170, 0], [-195, 0]] }]
    })
  })
})

describe('automatic type assignment', () => {
  const line = [[-170, 0], [-195, 0], [-170, 5]]
  const ring = [...line, [-170, 0]]
  const nohole = [[-180, 1], [-185, 1], [-175, 3], [-171, 3]]
  const hole = [...nohole, [-180, 1]]

  it('interprets not nested arrays', () => {
    expect(applyWebMapCoordinates(line)).toEqual({ type: 'LineString', coordinates: line })
    expect(applyWebMapCoordinates(ring)).toEqual({ type: 'LineString', coordinates: ring })
  })

  it('interprets nested arrays', () => {
    expect(applyWebMapCoordinates([line])).toEqual({ type: 'MultiLineString', coordinates: [line] })
    expect(applyWebMapCoordinates([line, hole])).toEqual({ type: 'MultiLineString', coordinates: [line, hole] })
    expect(applyWebMapCoordinates([ring])).toEqual({ type: 'Polygon', coordinates: [ring] })

    expect(applyWebMapCoordinates([ring, nohole])).toEqual({ type: 'MultiLineString', coordinates: [ring, nohole] })
    expect(applyWebMapCoordinates([ring, hole])).toEqual({ type: 'Polygon', coordinates: [ring, hole] })
  })

  it('interprets deep nested arrays', () => {
    expect(applyWebMapCoordinates([[ring]])).toEqual({ type: 'MultiPolygon', coordinates: [[ring]] })
  })
})
