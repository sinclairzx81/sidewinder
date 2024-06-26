import { Value } from '@sidewinder/value'
import { Type } from '@sidewinder/type'
import { Assert } from '../../assert/index'

describe('value/default/Promise', () => {
  it('Should use default', () => {
    const T = Type.Any({ default: 1 })
    const R = Value.Default(T, undefined)
    Assert.deepEqual(R, 1)
  })
  it('Should use value', () => {
    const T = Type.Any({ default: 1 })
    const R = Value.Default(T, null)
    Assert.deepEqual(R, null)
  })
})
