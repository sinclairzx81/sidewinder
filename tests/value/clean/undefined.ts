import { Value } from '@sidewinder/value'
import { Type } from '@sidewinder/type'
import { Assert } from '../../assert/index'

describe('value/clean/Undefined', () => {
  it('Should clean 1', () => {
    const T = Type.Undefined()
    const R = Value.Clean(T, null)
    Assert.deepEqual(R, null)
  })
})
