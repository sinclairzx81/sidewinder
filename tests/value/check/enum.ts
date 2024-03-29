import { Value } from '@sidewinder/value'
import { Type } from '@sidewinder/type'
import { Assert } from '../../assert/index'

describe('value/check/Enum', () => {
  enum Foo {
    A = 1,
    B = 2,
  }
  const T = Type.Enum(Foo)

  it('Should pass enum option A', () => {
    const value = Foo.A
    const result = Value.Check(T, value)
    Assert.equal(result, true)
  })

  it('Should pass enum option B', () => {
    const value = Foo.A
    const result = Value.Check(T, value)
    Assert.equal(result, true)
  })

  it('Should fail unknown value', () => {
    const value = 'unknown'
    const result = Value.Check(T, value)
    Assert.equal(result, false)
  })
  it('Should fail Date', () => {
    const value = new Date()
    const result = Value.Check(T, value)
    Assert.equal(result, false)
  })
})
