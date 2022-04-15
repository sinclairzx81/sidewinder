import { Value } from '@sidewinder/value'
import { Type } from '@sidewinder/type'
import { Assert } from '../../assert/index'

describe('value/upgrade/Array', () => {
  const T = Type.Array(Type.Number(), { default: [1, 2, 3] })
  const E = [1, 2, 3]

  it('Should upgrade from string', () => {
    const value = 'hello'
    const result = Value.Upgrade(T, value)
    Assert.deepEqual(result, E)
  })

  it('Should upgrade from number', () => {
    const value = 1
    const result = Value.Upgrade(T, value)
    Assert.deepEqual(result, E)
  })

  it('Should upgrade from boolean', () => {
    const value = true
    const result = Value.Upgrade(T, value)
    Assert.deepEqual(result, E)
  })

  it('Should upgrade from object', () => {
    const value = {}
    const result = Value.Upgrade(T, value)
    Assert.deepEqual(result, E)
  })

  it('Should upgrade from array', () => {
    const value = [1]
    const result = Value.Upgrade(T, value)
    Assert.deepEqual(result, [1])
  })

  it('Should upgrade from undefined', () => {
    const value = undefined
    const result = Value.Upgrade(T, value)
    Assert.deepEqual(result, E)
  })

  it('Should upgrade from null', () => {
    const value = null
    const result = Value.Upgrade(T, value)
    Assert.deepEqual(result, E)
  })

  it('Should preserve', () => {
    const value = [6, 7, 8]
    const result = Value.Upgrade(T, value)
    Assert.deepEqual(result, [6, 7, 8])
  })

  it('Should preserve with invalid element set to default', () => {
    const value = [6, 7, 8, 'hello', 9]
    const result = Value.Upgrade(T, value)
    Assert.deepEqual(result, [6, 7, 8, 0, 9])
  })
})
