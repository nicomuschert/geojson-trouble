import webmap from '../src'

describe('convenience', () => {
  it('can be used from default export', () => {
    expect(
      webmap({
        type: 'Polygon',
        bbox: [0, 0, 0, 0],
        coordinates: [[[156, 37], [143, 16], [-152, 15], [-158, 35], [156, 37]]]
      })
    ).toEqual({
      type: 'Polygon',
      bbox: [143, 15, 208, 37],
      coordinates: [[[156, 37], [143, 16], [208, 15], [202, 35], [156, 37]]]
    })
  })
})
