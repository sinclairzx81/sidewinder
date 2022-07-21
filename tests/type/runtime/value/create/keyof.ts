import { Value } from '@sidewinder/type/value'
import { Type } from '@sidewinder/type'
import { Assert } from '../../assert/index'

describe('value/create/KeyOf', () => {
  it('Should create value', () => {
    const T = Type.KeyOf(
      Type.Object({
        x: Type.Number(),
        y: Type.Number(),
      }),
    )
    Assert.deepEqual(Value.Create(T), 'x')
  })
  it('Should create default', () => {
    const T = Type.KeyOf(
      Type.Object({
        x: Type.Number(),
        y: Type.Number(),
      }),
      { default: 'y' },
    )
    Assert.deepEqual(Value.Create(T), 'y')
  })
})
