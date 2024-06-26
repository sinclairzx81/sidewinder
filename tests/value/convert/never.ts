import { Value } from '@sidewinder/value'
import { Type } from '@sidewinder/type'
import { Assert } from '../../assert/index'

describe('value/convert/Never', () => {
  it('Should not convert 1', () => {
    const T = Type.Never()
    const R = Value.Convert(T, true)
    Assert.deepEqual(R, true)
  })
  it('Should not convert 2', () => {
    const T = Type.Never()
    const R = Value.Convert(T, 42)
    Assert.deepEqual(R, 42)
  })
  it('Should not convert 3', () => {
    const T = Type.Never()
    const R = Value.Convert(T, 'true')
    Assert.deepEqual(R, 'true')
  })
})
