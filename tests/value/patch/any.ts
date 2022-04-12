import { Value } from '@sidewinder/value'
import { Type } from '@sidewinder/type'
import { Assert } from '../../assert/index'

describe('value/patch/Any', () => {
  const T = Type.Any()
  it('Should patch from string', () => {
    const value = 'hello'
    const result = Value.Patch(T, value)
    Assert.deepEqual(result, value)
  })
  it('Should patch from number', () => {
    const value = 1
    const result = Value.Patch(T, value)
    Assert.deepEqual(result, value)
  })
  it('Should patch from boolean', () => {
    const value = false
    const result = Value.Patch(T, value)
    Assert.deepEqual(result, value)
  })
  it('Should patch from object', () => {
    const value = {}
    const result = Value.Patch(T, value)
    Assert.deepEqual(result, value)
  })
  it('Should patch from array', () => {
    const value = [1]
    const result = Value.Patch(T, value)
    Assert.deepEqual(result, value)
  })

  it('Should patch from undefined', () => {
    const value = undefined
    const result = Value.Patch(T, value)
    Assert.deepEqual(result, value)
  })

  it('Should patch from null', () => {
    const value = null
    const result = Value.Patch(T, value)
    Assert.deepEqual(result, value)
  })

  it('Should preserve', () => {
    const value = { a: 1, b: 2 }
    const result = Value.Patch(T, value)
    Assert.deepEqual(result, { a: 1, b: 2 })
  })
})
