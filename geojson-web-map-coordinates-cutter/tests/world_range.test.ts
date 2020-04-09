import { Polygon, MultiPolygon, Position } from 'geojson'
import Cutter from '../src'
import worldRange from './resources/world_range.json'

const worldRangeGeometry: Polygon = worldRange.geometry as Polygon
const worldRangeCoordinates: Position[][] = worldRange.geometry.coordinates
const worldRangeCutted: MultiPolygon = worldRange.cutted as MultiPolygon
const worldRangeCuttedAndTranslated: MultiPolygon = worldRange.cuttedAndTranslated as MultiPolygon

describe('world range', () => {
  it('produces the expected geometry', () => {
    expect(new Cutter(false).cut(worldRangeGeometry)).toEqual(worldRangeCutted)
  })

  it('produces the expected geometry from coordinates', () => {
    expect(new Cutter(false).cut(worldRangeCoordinates)).toEqual(worldRangeCutted)
  })

  it('translates to the expected geometry', () => {
    expect(new Cutter().cut(worldRangeGeometry)).toEqual(worldRangeCuttedAndTranslated)
  })

  it('translates to the expected geometry from coordinates', () => {
    expect(new Cutter().cut(worldRangeCoordinates)).toEqual(worldRangeCuttedAndTranslated)
  })
})
