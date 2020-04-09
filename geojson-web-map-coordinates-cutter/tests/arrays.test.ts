import { Position, Point, LineString, MultiLineString, Polygon, MultiPolygon } from 'geojson'
import Cutter from '../src'
import array from './resources/arrays.json'

type GeomArr = {
  description: string
  coordinates: Position | Position[] | Position[][] | Position[][][]
  expectation: Point | LineString | MultiLineString | Polygon | MultiPolygon
}[]

const geometries: GeomArr = array as GeomArr

describe('array bulk', () => {
  const cutter = new Cutter(false)

  for (const { description, coordinates, expectation } of geometries) {
    // if (description !== 'unintuitive polygon with kinks') continue
    // console.log(JSON.stringify(cutter.cut(coordinates)))
    // continue

    it(description, () => {
      expect(cutter.cut(coordinates)).toEqual(expectation)
    })
  }
})
