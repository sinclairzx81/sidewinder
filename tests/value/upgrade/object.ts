import { Value } from '@sidewinder/value'
import { Type } from '@sidewinder/type'
import { Assert } from '../../assert/index'

describe('value/upgrade/Object', () => {
  const T = Type.Object({
    a: Type.Number({ default: 'a' }),
    b: Type.Number({ default: 'b' }),
    c: Type.Number({ default: 'c' }),
    x: Type.Number({ default: 0 }),
    y: Type.Number({ default: 1 }),
    z: Type.Number({ default: 2 }),
  })
  const E = {
    x: 0,
    y: 1,
    z: 2,
    a: 'a',
    b: 'b',
    c: 'c',
  }

  it('Should upgrade from string', () => {
    const value = 'hello'
    const result = Value.Upgrade(T, value)
    Assert.deepEqual(result, E)
  })
  it('Should upgrade from number', () => {
    const value = E
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
    const value = { x: 7, y: 8, z: 9, a: 10, b: 11, c: 12 }
    const result = Value.Upgrade(T, value)
    Assert.deepEqual(result, {
      x: 7,
      y: 8,
      z: 9,
      a: 10,
      b: 11,
      c: 12,
    })
  })
  it('Should upgrade and preserve partial object', () => {
    const value = { x: 7, y: 8, z: 9 }
    const result = Value.Upgrade(T, value)
    Assert.deepEqual(result, {
      x: 7,
      y: 8,
      z: 9,
      a: 'a',
      b: 'b',
      c: 'c',
    })
  })

  it('Should upgrade and preserve partial object with incorrect properties', () => {
    const value = { x: true, y: 8, z: 9 }
    const result = Value.Upgrade(T, value)
    Assert.deepEqual(result, {
      x: 0,
      y: 8,
      z: 9,
      a: 'a',
      b: 'b',
      c: 'c',
    })
  })

  it('Should upgrade and preserve partial object and omit unknown properties', () => {
    const value = { x: 7, y: 8, z: 9, unknown: 'foo' }
    const result = Value.Upgrade(T, value)
    Assert.deepEqual(result, {
      x: 7,
      y: 8,
      z: 9,
      a: 'a',
      b: 'b',
      c: 'c',
    })
  })
})
