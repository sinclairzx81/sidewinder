import { Value } from '@sidewinder/value'
import { Type } from '@sidewinder/type'
import { Assert } from '../../assert/index'

describe('value/clean/Enum', () => {
  it('Should clean 1', () => {
    const T = Type.Enum({ x: 1, y: 2 })
    const R = Value.Clean(T, null)
    Assert.deepEqual(R, null)
  })
})
