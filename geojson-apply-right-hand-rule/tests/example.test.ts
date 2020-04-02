import { applyRightHandRule } from '../src'

describe('Polygon with invalid inner ring', () => {
  it('will fix the inner ring', () => {
    const polygonCoordinatesWithInvalidInnerRing = [
      [[-170, 0], [-195, 0], [-170, 5], [-170, 0]], // valid outer ring
      [[-180, 1], [-185, 1], [-175, 3], [-171, 3], [-180, 1]] // invalid inner ring
    ]

    expect(applyRightHandRule(polygonCoordinatesWithInvalidInnerRing)).toEqual({
      type: 'Polygon',
      coordinates: [
        [[-170, 0], [-170, 5], [-195, 0], [-170, 0]], // valid outer ring
        [[-180, 1], [-185, 1], [-175, 3], [-171, 3], [-180, 1]] // valid inner ring
      ]
    })
  })
})
