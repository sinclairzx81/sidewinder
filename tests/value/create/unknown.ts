import { Value } from '@sidewinder/value'
import { Type } from '@sidewinder/type'
import { Assert } from '../../assert/index'

describe('value/create/Unknown', () => {
  it('Should create value', () => {
    const T = Type.Unknown()
    Assert.deepEqual(Value.Create(T), {})
  })
  it('Should create default', () => {
    const T = Type.Unknown({ default: 1 })
    Assert.deepEqual(Value.Create(T), 1)
  })
})
