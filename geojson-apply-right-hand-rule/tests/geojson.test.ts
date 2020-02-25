import { applyRightHandRule } from '../src'
import { Polygon, MultiPolygon, LineString, GeometryCollection } from 'geojson'

import _clockwise from './resources/clockwise.json'
import _counterclockwise from './resources/counterclockwise.json'

const validPolygon: Polygon = {
  type: 'Polygon',
  coordinates: [_counterclockwise, _clockwise]
}

const validMultiPolygon: MultiPolygon = {
  type: 'MultiPolygon',
  coordinates: [[_counterclockwise], [_counterclockwise, _clockwise]]
}

describe('Polygon', () => {
  it('is getting fixed', () => {
    const polygon: Polygon = { type: 'Polygon', coordinates: [_clockwise, _counterclockwise] }
    const result = applyRightHandRule(polygon)

    expect(result).toBe(polygon)
    expect(result).toEqual(validPolygon)
  })

  it('does not need to be fixed', () => {
    const polygon: Polygon = { type: 'Polygon', coordinates: [_counterclockwise, _clockwise] }
    const result = applyRightHandRule(polygon)

    expect(result).toEqual(validPolygon)
  })

  it('has been created from detached ring', () => {
    const expectedPolygon = { type: 'Polygon', coordinates: [_counterclockwise] }
    expect(applyRightHandRule(_counterclockwise)).toEqual(expectedPolygon)
    expect(applyRightHandRule(_clockwise)).toEqual(expectedPolygon)
  })

  it('has been created from polygon rings', () => {
    expect(applyRightHandRule([_clockwise, _counterclockwise])).toEqual(validPolygon)
    expect(applyRightHandRule([_counterclockwise, _clockwise])).toEqual(validPolygon)
  })
})

describe('MultiPolygon', () => {
  it('is getting fixed', () => {
    const mult: MultiPolygon = { type: 'MultiPolygon', coordinates: [[_clockwise], [_clockwise, _counterclockwise]] }
    const result = applyRightHandRule(mult)

    expect(result).toBe(mult)
    expect(result).toEqual(validMultiPolygon)
  })

  it('has been created from multi-polygon rings', () => {
    const expectedMult = { type: 'MultiPolygon', coordinates: [[_counterclockwise]] }
    expect(applyRightHandRule([[_counterclockwise]])).toEqual(expectedMult)
    expect(applyRightHandRule([[_clockwise]])).toEqual(expectedMult)
  })
})

describe('GeometryCollection', () => {
  it('walks over collections', () => {
    const invalidPolygon: Polygon = { type: 'Polygon', coordinates: [_clockwise, _counterclockwise] }
    const collection: GeometryCollection = { type: 'GeometryCollection', geometries: [invalidPolygon] }

    expect((applyRightHandRule(collection) as GeometryCollection).geometries[0]).toEqual(validPolygon)
  })

  it('leaves non-polygons unchanged', () => {
    const lineString: LineString = { type: 'LineString', coordinates: _counterclockwise }
    const lineStringCopy = JSON.parse(JSON.stringify(lineString))
    const collection: GeometryCollection = { type: 'GeometryCollection', geometries: [lineString] }

    expect((applyRightHandRule(collection) as GeometryCollection).geometries[0]).toEqual(lineStringCopy)
  })
})
