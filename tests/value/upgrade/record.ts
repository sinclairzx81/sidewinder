import { Value } from '@sidewinder/value'
import { Type } from '@sidewinder/type'
import { Assert } from '../../assert/index'

describe('value/upgrade/Record', () => {
  const T = Type.Record(
    Type.String(),
    Type.Object({
      x: Type.Number(),
      y: Type.Number(),
      z: Type.Number(),
    }),
  )
  const E = {}

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
    const value = {
      a: { x: 1, y: 2, z: 3 },
      b: { x: 4, y: 5, z: 6 },
    }
    const result = Value.Upgrade(T, value)
    Assert.deepEqual(result, value)
  })
  it('Should preserve and patch invalid records', () => {
    const value = {
      a: { x: 1, y: 2, z: 3 },
      b: { x: 4, y: 5, z: true },
      c: [1, 2, 3],
      d: 1,
      e: { x: 1, y: 2, w: 9000 },
    }
    const result = Value.Upgrade(T, value)
    Assert.deepEqual(result, {
      a: { x: 1, y: 2, z: 3 },
      b: { x: 4, y: 5, z: 0 },
      c: { x: 0, y: 0, z: 0 },
      d: { x: 0, y: 0, z: 0 },
      e: { x: 1, y: 2, z: 0 },
    })
  })
})
