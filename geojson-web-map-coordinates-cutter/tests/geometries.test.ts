import { Geometry } from 'geojson'
import Cutter from '../src'
import array from './resources/geometries.json'

type GeomArr = {
  description: string
  geometry: Geometry
  cutted?: Geometry
  cuttedAndTranslated?: Geometry
}[]

const geometries: GeomArr = array as GeomArr

describe('array bulk', () => {
  const cutter = new Cutter(false)
  const translator = new Cutter()

  for (const { description, geometry, cutted, cuttedAndTranslated } of geometries) {
    // if (description !== 'american holes') continue
    // console.log(JSON.stringify(cutter.cut(geometry)))
    // console.log(JSON.stringify(translator.cut(geometry)))
    // continue

    it(description, () => {
      expect(cutter.cut(geometry)).toEqual(cutted || geometry)
      expect(translator.cut(geometry)).toEqual(cuttedAndTranslated || geometry)
    })
  }
})
