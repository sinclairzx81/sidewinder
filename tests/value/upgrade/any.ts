import { Value } from '@sidewinder/value'
import { Type } from '@sidewinder/type'
import { Assert } from '../../assert/index'

describe('value/upgrade/Any', () => {
  const T = Type.Any()
  it('Should upgrade from string', () => {
    const value = 'hello'
    const result = Value.Upgrade(T, value)
    Assert.deepEqual(result, value)
  })
  it('Should upgrade from number', () => {
    const value = 1
    const result = Value.Upgrade(T, value)
    Assert.deepEqual(result, value)
  })
  it('Should upgrade from boolean', () => {
    const value = false
    const result = Value.Upgrade(T, value)
    Assert.deepEqual(result, value)
  })
  it('Should upgrade from object', () => {
    const value = {}
    const result = Value.Upgrade(T, value)
    Assert.deepEqual(result, value)
  })
  it('Should upgrade from array', () => {
    const value = [1]
    const result = Value.Upgrade(T, value)
    Assert.deepEqual(result, value)
  })
  it('Should upgrade from undefined', () => {
    const value = undefined
    const result = Value.Upgrade(T, value)
    Assert.deepEqual(result, value)
  })
  it('Should upgrade from null', () => {
    const value = null
    const result = Value.Upgrade(T, value)
    Assert.deepEqual(result, value)
  })
  it('Should preserve', () => {
    const value = { a: 1, b: 2 }
    const result = Value.Upgrade(T, value)
    Assert.deepEqual(result, { a: 1, b: 2 })
  })
})
