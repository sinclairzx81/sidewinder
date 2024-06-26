import { Value } from '@sidewinder/value'
import { Type } from '@sidewinder/type'
import { Assert } from '../../assert/index'

describe('value/convert/Promise', () => {
  const T = Type.Promise(Type.Any())
  it('Should passthrough 1', () => {
    const V = Promise.resolve(1)
    const R = Value.Convert(T, V)
    Assert.deepEqual(R, V)
  })
  it('Should passthrough 2', () => {
    const V = 1
    const R = Value.Convert(T, V)
    Assert.deepEqual(R, V)
  })
})
