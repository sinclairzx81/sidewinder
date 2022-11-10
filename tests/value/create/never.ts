import { Value } from '@sidewinder/value'
import { Type } from '@sidewinder/type'
import { Assert } from '../../assert/index'

describe('value/create/Never', () => {
  it('Should create value', () => {
    const T = Type.Never()
    Assert.throws(() => Value.Create(T))
  })
})
