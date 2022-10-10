import { Value } from '@sidewinder/value'
import { Type } from '@sidewinder/type'
import { Assert } from '../../assert/index'

describe('value/upcast/Never', () => {
  const T = Type.Never()
  it('Should throw from string', () => {
    const value = 'hello'
    Assert.throws(() => Value.Upcast(T, value))
  })
  it('Should throw from number', () => {
    const value = 1
    Assert.throws(() => Value.Upcast(T, value))
  })
  it('Should throw from boolean', () => {
    const value = false
    Assert.throws(() => Value.Upcast(T, value))
  })
  it('Should throw from object', () => {
    const value = {}
    Assert.throws(() => Value.Upcast(T, value))
  })
  it('Should throw from array', () => {
    const value = [1]
    Assert.throws(() => Value.Upcast(T, value))
  })
  it('Should throw from undefined', () => {
    const value = undefined
    Assert.throws(() => Value.Upcast(T, value))
  })
  it('Should throw from null', () => {
    const value = null
    Assert.throws(() => Value.Upcast(T, value))
  })
})
