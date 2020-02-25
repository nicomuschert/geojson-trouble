import { fixRings } from '../src'
import { Position } from 'geojson'

import _clockwise from './resources/clockwise.json'
import _counterclockwise from './resources/counterclockwise.json'
import _interiorInvalid from './resources/interior-invalid.json'
import _interiorValid from './resources/interior-valid.json'

const clockwiseRing: Position[][] = [_clockwise]
const counterclockwiseRing: Position[][] = [_counterclockwise]

describe('Exterior (outer) ring', () => {
  it('remains unchanged if counter clockwise', () => {
    expect(fixRings(counterclockwiseRing)).toEqual(counterclockwiseRing)
  })

  it('becomes fixed if clockwise', () => {
    expect(fixRings(clockwiseRing)).toEqual(counterclockwiseRing)
  })
})

describe('Interior (inner) ring', () => {
  it('remains unchanged if clockwise', () => {
    const geometry = counterclockwiseRing.concat(clockwiseRing)
    expect(fixRings(geometry)).toEqual(geometry)
  })

  it('becomes fixed if counter clockwise', () => {
    const geometry = counterclockwiseRing.concat(counterclockwiseRing)
    expect(fixRings(geometry)[1]).toEqual(clockwiseRing[0])
  })
})

describe('Outer ring with inversion', () => {
  it('remains unchanged if clockwise', () => {
    expect(fixRings(clockwiseRing, true)).toEqual(clockwiseRing)
  })

  it('becomes fixed if counter clockwise', () => {
    expect(fixRings(counterclockwiseRing, true)).toEqual(clockwiseRing)
  })
})

describe('Inner ring with inversion', () => {
  it('remains unchanged if counter clockwise', () => {
    const geometry = clockwiseRing.concat(counterclockwiseRing)
    expect(fixRings(geometry, true)).toEqual(geometry)
  })

  it('becomes fixed if clockwise', () => {
    const geometry = clockwiseRing.concat(clockwiseRing)
    expect(fixRings(geometry, true)[1]).toEqual(counterclockwiseRing[0])
  })
})

describe('Rings that are not closed', () => {
  it('become closed', () => {
    const openRings = [_counterclockwise.slice(0, -1), _clockwise.slice(0, -1)]
    expect(fixRings(openRings)).toEqual([_counterclockwise, _clockwise])
  })
})

describe('Sample interior ring', () => {
  it('get fixed', () => {
    const geometry = counterclockwiseRing.concat([_interiorInvalid])
    expect(fixRings(geometry)[1]).toEqual(_interiorValid)
  })

  it('can get reversed', () => {
    const geometry = clockwiseRing.concat([_interiorValid])
    expect(fixRings(geometry, true)[1]).toEqual(_interiorInvalid)
  })
})

describe('Execution', () => {
  const geometry = counterclockwiseRing
    .concat(clockwiseRing)
    .concat(counterclockwiseRing)
    .map(ring => ring.map(([lon, lat]) => [lon, lat]))

  it('does not modify rings by reference', () => {
    const expectedString = JSON.stringify(geometry)
    fixRings(geometry)
    expect(JSON.stringify(geometry)).toBe(expectedString)
  })

  it('does not return passed ring references', () => {
    const refStat = fixRings(geometry).map(ring => !geometry.includes(ring))
    expect(refStat).toEqual([true, true, true])
  })
})
