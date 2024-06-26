import { Value } from '@sidewinder/value'
import { Type } from '@sidewinder/type'
import { Assert } from '../../assert/index'

describe('value/clean/String', () => {
  it('Should clean 1', () => {
    const T = Type.String()
    const R = Value.Clean(T, null)
    Assert.deepEqual(R, null)
  })
})
