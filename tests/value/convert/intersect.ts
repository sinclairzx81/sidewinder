import { Value } from '@sidewinder/value'
import { Type } from '@sidewinder/type'
import { Assert } from '../../assert/index'

describe('value/convert/Intersect', () => {
  it('Should convert intersected objects', () => {
    // prettier-ignore
    const T = Type.Intersect([
      Type.Object({ x: Type.Number() }),
      Type.Object({ y: Type.Number() })
    ])
    const R = Value.Convert(T, { x: '1', y: '2' })
    Assert.deepEqual(R, { x: 1, y: 2 })
  })
})
