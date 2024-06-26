import { Value } from '@sidewinder/value'
import { Type } from '@sidewinder/type'
import { Assert } from '../../assert/index'

describe('value/default/Array', () => {
  it('Should use default', () => {
    const T = Type.Array(Type.Number(), { default: 1 })
    const R = Value.Default(T, undefined)
    Assert.deepEqual(R, 1)
  })
  it('Should use value', () => {
    const T = Type.Array(Type.Number(), { default: 1 })
    const R = Value.Default(T, null)
    Assert.deepEqual(R, null)
  })
  // ----------------------------------------------------------------
  // Elements
  // ----------------------------------------------------------------
  it('Should use default on elements', () => {
    const T = Type.Array(Type.Number({ default: 2 }))
    const R = Value.Default(T, [1, undefined, 3])
    Assert.deepEqual(R, [1, 2, 3])
  })
})
