import { Value } from '@sidewinder/value'
import { Type } from '@sidewinder/type'
import { Assert } from '../../assert/index'

describe('value/check/RegEx', () => {
  it('Should pass regex', () => {
    const T = Type.RegEx(/foo/)
    const value = 'foo'
    const result = Value.Check(T, value)
    Assert.equal(result, true)
  })

  it('Should fail regex', () => {
    const T = Type.RegEx(/foo/)
    const value = 'bar'
    const result = Value.Check(T, value)
    Assert.equal(result, false)
  })
})
