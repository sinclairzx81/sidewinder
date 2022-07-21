import { Value } from '@sidewinder/type/value'
import { Type } from '@sidewinder/type'
import { Assert } from '../../assert/index'

describe('value/create/Null', () => {
  it('Should create value', () => {
    const T = Type.Null()
    Assert.deepEqual(Value.Create(T), null)
  })
})
