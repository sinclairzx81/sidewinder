import { Value } from '@sidewinder/value'
import { Type, Kind } from '@sidewinder/type'
import { Assert } from '../../assert/index'

describe('value/clean/Kind', () => {
  it('Should clean 1', () => {
    const T = Type.Unsafe({ [Kind]: 'Unknown' })
    const R = Value.Clean(T, null)
    Assert.deepEqual(R, null)
  })
})
