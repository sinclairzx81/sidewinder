import { Value } from '@sidewinder/value'
import { Type } from '@sidewinder/type'
import { Assert } from '../../assert/index'

describe('value/create/RegEx', () => {
  it('Should throw without a default value', () => {
    Assert.throws(() => {
      const T = Type.RegEx(/foo/)
      Value.Create(T)
    })
  })
  it('Should create default', () => {
    const T = Type.RegEx(/foo/, { default: 'foo' })
    Assert.deepEqual(Value.Create(T), 'foo')
  })
})
