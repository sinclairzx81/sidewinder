import { Value } from '@sidewinder/value'
import { Type } from '@sidewinder/type'
import { Assert } from '../../assert/index'

describe('value/default/String', () => {
  it('Should use default', () => {
    const T = Type.String({ default: 1 })
    const R = Value.Default(T, undefined)
    Assert.deepEqual(R, 1)
  })
  it('Should use value', () => {
    const T = Type.String({ default: 1 })
    const R = Value.Default(T, null)
    Assert.deepEqual(R, null)
  })
})
