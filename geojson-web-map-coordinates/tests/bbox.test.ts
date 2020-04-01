import { bbox } from '../src'

describe('build bbox', () => {
  it('works for single point coordinates', () => {
    expect(bbox([165, 0])).toEqual([165, 0, 165, 0])
  })

  it('works for polygon', () => {
    expect(bbox({ type: 'Polygon', coordinates: [[[-170, 0], [165, 10], [-170, 0]]] })).toEqual([-170, 0, 165, 10])
  })

  it('works for different coordinates', () => {
    const geometries = [
      [[-170, 0], [165, 0]], // Position[]
      [[[-170, 0], [165, 0]]], // Position[][]
      [[[[-170, 0], [165, 0]]]], // Position[][][]
      { type: 'LineString', coordinates: [[-170, 0], [165, 0]] },
      { type: 'GeometryCollection', geometries: [{ type: 'LineString', coordinates: [[-170, 0], [165, 0]] }] }
    ]

    for (const geometry of geometries) {
      expect(bbox(geometry as any)).toEqual([-170, 0, 165, 0])
    }
  })
})
