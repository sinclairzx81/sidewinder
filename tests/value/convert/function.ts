import { Value } from '@sidewinder/value'
import { Type } from '@sidewinder/type'
import { Assert } from '../../assert/index'

describe('value/convert/Function', () => {
  const T = Type.Function([], Type.Any())
  it('Should passthrough 1', () => {
    const V = function () {}
    const R = Value.Convert(T, V)
    Assert.deepEqual(R, V)
  })
  it('Should passthrough 2', () => {
    const V = 1
    const R = Value.Convert(T, V)
    Assert.deepEqual(R, V)
  })
})
