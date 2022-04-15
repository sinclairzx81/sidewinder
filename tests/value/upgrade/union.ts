import { Value } from '@sidewinder/value'
import { Type } from '@sidewinder/type'
import { Assert } from '../../assert/index'

describe('value/upgrade/Union', () => {
  const A = Type.Object({
    type: Type.Literal('A'),
    x: Type.Number(),
    y: Type.Number(),
    z: Type.Number(),
  })
  const B = Type.Object({
    type: Type.Literal('B'),
    a: Type.String(),
    b: Type.String(),
    c: Type.String(),
  })
  const T = Type.Union([A, B])

  const E = {
    type: 'A',
    x: 0,
    y: 0,
    z: 0,
  }

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

  it('Should preserve A', () => {
    const value = { type: 'A', x: 1, y: 2, z: 3 }
    const result = Value.Upgrade(T, value)
    Assert.deepEqual(result, value)
  })

  it('Should preserve B', () => {
    const value = { type: 'B', a: 'a', b: 'b', c: 'c' }
    const result = Value.Upgrade(T, value)
    Assert.deepEqual(result, value)
  })

  it('Should infer A into B through heuristics', () => {
    const value = { type: 'A', a: 'a', b: 'b', c: 'c' }
    const result = Value.Upgrade(T, value)
    Assert.deepEqual(result, { type: 'B', a: 'a', b: 'b', c: 'c' })
  })

  it('Should infer B into A through heuristics', () => {
    const value = { type: 'B', x: 1, y: 2, z: 3 }
    const result = Value.Upgrade(T, value)
    Assert.deepEqual(result, { type: 'A', x: 1, y: 2, z: 3 })
  })

  it('Should infer A into B through heuristics and fix property', () => {
    const value = { type: 'A', a: 'a', b: 'b', c: true }
    const result = Value.Upgrade(T, value)
    Assert.deepEqual(result, { type: 'B', a: 'a', b: 'b', c: '' })
  })

  it('Should infer B into A through heuristics and fix property', () => {
    const value = { type: 'B', x: 1, y: 2, z: true }
    const result = Value.Upgrade(T, value)
    Assert.deepEqual(result, { type: 'A', x: 1, y: 2, z: 0 })
  })
})
