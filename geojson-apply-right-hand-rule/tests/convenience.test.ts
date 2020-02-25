import fix from '../src'

import _clockwise from './resources/clockwise.json'
import _counterclockwise from './resources/counterclockwise.json'

describe('Default export', () => {
  it('applies only non-inversely', () => {
    const result = [_clockwise, _counterclockwise, _clockwise].map(fix).map((polygon: any) => polygon.coordinates[0])
    expect(result).toEqual([_counterclockwise, _counterclockwise, _counterclockwise])
  })
})
