import { Position, LineString } from 'geojson'
import { applyWebMapCoordinates } from '../src'

describe('how to revert the applied web-map', () => {
  it('works in positive range', () => {
    const input: Position[] = [[156, 37], [143, 16], [208, 15], [202, 35]]
    const output: LineString = applyWebMapCoordinates(input, true) as LineString

    expect(output.coordinates).toEqual([[156, 37], [143, 16], [-152, 15], [-158, 35]])
  })

  it('works with a larger sample', () => {
    let input = [[-179, -27], [-206, -27], [-182, -17], [-135, -17], [-74, -37], [-34, -7], [11, -16], [41, -14]]
    input = [...input, [113, -24], [153, -24], [178, -37], [214, -26], [249, 23], [300, 23], [350, 35], [400, 35]]
    input = [...input, [473, -23], [638, -5], [673, 61]]

    let expected = [[-179, -27], [154, -27], [178, -17], [-135, -17], [-74, -37], [-34, -7], [11, -16]]
    expected = [...expected, [41, -14], [113, -24], [153, -24], [178, -37], [-146, -26], [-111, 23]]
    expected = [...expected, [-60, 23], [-10, 35], [40, 35], [113, -23], [-82, -5], [-47, 61]]

    expect(applyWebMapCoordinates(input, true)).toEqual({ type: 'LineString', coordinates: expected })
  })
})
