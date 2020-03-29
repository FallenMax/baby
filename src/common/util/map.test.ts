import { map } from './map'
import { decodeField, encodeField } from './serialize'

describe('map', () => {
  test('works', () => {
    const date = new Date(1999, 0, 1, 0, 0, 0, 0)
    const original = {
      arr: [
        {
          a: 123,
          b: {
            c: date,
          },
        },
        {
          a: 123,
          b: {
            c: date,
          },
        },
      ],
    }

    const str = JSON.stringify(map(original, encodeField))
    const restored = map(JSON.parse(str), decodeField)
    expect(restored).toEqual(original)
  })
})
