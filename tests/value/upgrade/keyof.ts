import { Value } from '@sidewinder/value'
import { Type } from '@sidewinder/type'
import { Assert } from '../../assert/index'

describe('value/upgrade/KeyOf', () => {
  const T = Type.KeyOf(
    Type.Object({
      x: Type.Number(),
      y: Type.Number(),
      z: Type.Number(),
    }),
  )
  const E = 'x'

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
    Assert.deepEqual(result, E)
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
    const value = 'y'
    const result = Value.Upgrade(T, value)
    Assert.deepEqual(result, 'y')
  })
})
