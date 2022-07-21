import { Value } from '@sidewinder/type/value'
import { Type } from '@sidewinder/type'
import { Assert } from '../../assert/index'

describe('value/cast/Unknown', () => {
  const T = Type.Unknown()
  it('Should upcast from string', () => {
    const value = 'hello'
    const result = Value.Cast(T, value)
    Assert.deepEqual(result, value)
  })
  it('Should upcast from number', () => {
    const value = 1
    const result = Value.Cast(T, value)
    Assert.deepEqual(result, value)
  })
  it('Should upcast from boolean', () => {
    const value = false
    const result = Value.Cast(T, value)
    Assert.deepEqual(result, value)
  })
  it('Should upcast from object', () => {
    const value = {}
    const result = Value.Cast(T, value)
    Assert.deepEqual(result, value)
  })
  it('Should upcast from array', () => {
    const value = [1]
    const result = Value.Cast(T, value)
    Assert.deepEqual(result, value)
  })

  it('Should upcast from undefined', () => {
    const value = undefined
    const result = Value.Cast(T, value)
    Assert.deepEqual(result, value)
  })

  it('Should upcast from null', () => {
    const value = null
    const result = Value.Cast(T, value)
    Assert.deepEqual(result, value)
  })

  it('Should preserve', () => {
    const value = { a: 1, b: 2 }
    const result = Value.Cast(T, value)
    Assert.deepEqual(result, { a: 1, b: 2 })
  })
})
