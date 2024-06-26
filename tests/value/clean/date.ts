import { Value } from '@sidewinder/value'
import { Type } from '@sidewinder/type'
import { Assert } from '../../assert/index'

describe('value/clean/Date', () => {
  it('Should clean 1', () => {
    const T = Type.Date()
    const R = Value.Clean(T, null)
    Assert.deepEqual(R, null)
  })
})
