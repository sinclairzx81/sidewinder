import { Value } from '@sidewinder/value'
import { Type } from '@sidewinder/type'
import { Assert } from '../../assert/index'

describe('value/patch/Integer', () => {
  const T = Type.Integer()
  const E = 0

  it('Should patch from string', () => {
    const value = 'hello'
    const result = Value.Patch(T, value)
    Assert.deepEqual(result, E)
  })
  it('Should patch from number', () => {
    const value = 1
    const result = Value.Patch(T, value)
    Assert.deepEqual(result, 1)
  })
  it('Should patch from boolean', () => {
    const value = true
    const result = Value.Patch(T, value)
    Assert.deepEqual(result, E)
  })
  it('Should patch from object', () => {
    const value = {}
    const result = Value.Patch(T, value)
    Assert.deepEqual(result, E)
  })

  it('Should patch from array', () => {
    const value = [1]
    const result = Value.Patch(T, value)
    Assert.deepEqual(result, E)
  })

  it('Should patch from undefined', () => {
    const value = undefined
    const result = Value.Patch(T, value)
    Assert.deepEqual(result, E)
  })

  it('Should patch from null', () => {
    const value = null
    const result = Value.Patch(T, value)
    Assert.deepEqual(result, E)
  })
})