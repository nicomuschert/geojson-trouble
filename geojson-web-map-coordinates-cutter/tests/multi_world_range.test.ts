import { GeometryCollection, Polygon, LineString } from 'geojson'
import Cutter from '../src'
import multiWorldRange from './resources/multi_world_range.json'

const geometry: GeometryCollection = multiWorldRange.geometry as GeometryCollection
const cutted: GeometryCollection = multiWorldRange.cutted as GeometryCollection
const cuttedAndTranslated: GeometryCollection = multiWorldRange.cuttedAndTranslated as GeometryCollection

const line = geometry.geometries[0] as LineString
const polygon = geometry.geometries[1] as Polygon
const reverseCutted: GeometryCollection = multiWorldRange.reverseCutted as GeometryCollection
const reversedGeometry: GeometryCollection = {
  type: 'GeometryCollection',
  geometries: [
    { type: 'LineString', coordinates: line.coordinates.slice().reverse() },
    { type: 'Polygon', coordinates: polygon.coordinates.map(coords => coords.slice().reverse()) }
  ]
}

describe('multi world range', () => {
  it('produces the expected geometry', () => {
    expect(new Cutter(false).cut(geometry)).toEqual(cutted)
  })

  it('translates to the expected geometry', () => {
    expect(new Cutter().cut(geometry)).toEqual(cuttedAndTranslated)
  })

  it('produces the expected geometry (reversed polygon)', () => {
    expect(new Cutter(false).cut(reversedGeometry)).toEqual(reverseCutted)
  })
})
