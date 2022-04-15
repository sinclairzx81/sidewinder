import { Value } from '@sidewinder/value'
import { Type } from '@sidewinder/type'
import { Assert } from '../../assert/index'

describe('value/upgrade/Tuple', () => {
  const T = Type.Tuple([Type.Number(), Type.String()])
  const E = [0, '']

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
    Assert.deepEqual(result, [1, ''])
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
    const value = [42, 'world']
    const result = Value.Upgrade(T, value)
    Assert.deepEqual(result, value)
  })

  it('Should upgrade with empty', () => {
    const value = [] as any[]
    const result = Value.Upgrade(T, value)
    Assert.deepEqual(result, E)
  })

  it('Should append with less than tuple length', () => {
    const value = [42]
    const result = Value.Upgrade(T, value)
    Assert.deepEqual(result, [42, ''])
  })

  it('Should truncate with greater than tuple length', () => {
    const value = [42, '', true]
    const result = Value.Upgrade(T, value)
    Assert.deepEqual(result, [42, ''])
  })

  it('Should preserve and patch invalid element', () => {
    const value = [true, 'hello']
    const result = Value.Upgrade(T, value)
    Assert.deepEqual(result, [0, 'hello'])
  })
})
