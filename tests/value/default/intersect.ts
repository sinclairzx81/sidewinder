import { Value } from '@sidewinder/value'
import { Type } from '@sidewinder/type'
import { Assert } from '../../assert/index'

describe('value/default/Intersect', () => {
  // ----------------------------------------------------------------
  // Intersected
  // ----------------------------------------------------------------
  it('Should use default intersected 1', () => {
    const A = Type.Object({
      a: Type.Number({ default: 1 }),
    })
    const B = Type.Object({
      b: Type.Number({ default: 2 }),
    })
    const T = Type.Intersect([A, B])
    const R = Value.Default(T, {})
    Assert.deepEqual(R, { a: 1, b: 2 })
  })
  it('Should use default intersected 2', () => {
    const A = Type.Object({
      a: Type.Number(),
    })
    const B = Type.Object({
      b: Type.Number(),
    })
    const T = Type.Intersect([A, B])
    const R = Value.Default(T, {})
    Assert.deepEqual(R, {})
  })
  it('Should use default intersected 3', () => {
    const A = Type.Object({
      a: Type.Number({ default: 1 }),
    })
    const B = Type.Object({
      b: Type.Number({ default: 2 }),
    })
    const T = Type.Intersect([A, B])
    const R = Value.Default(T, { a: 3 })
    Assert.deepEqual(R, { a: 3, b: 2 })
  })
  it('Should use default intersected 4', () => {
    const A = Type.Object({
      a: Type.Number({ default: 1 }),
    })
    const B = Type.Object({
      b: Type.Number({ default: 2 }),
    })
    const T = Type.Intersect([A, B])
    const R = Value.Default(T, { a: 4, b: 5 })
    Assert.deepEqual(R, { a: 4, b: 5 })
  })
  // ----------------------------------------------------------------
  // Intersected Deep
  // ----------------------------------------------------------------
  it('Should use default intersected deep 1', () => {
    const A = Type.Object({ a: Type.Number({ default: 1 }) })
    const B = Type.Object({ b: Type.Number({ default: 2 }) })
    const C = Type.Object({ c: Type.Number({ default: 3 }) })
    const D = Type.Object({ d: Type.Number({ default: 4 }) })
    const T1 = Type.Intersect([A, B])
    const T2 = Type.Intersect([C, D])
    const T = Type.Intersect([T1, T2])
    const R = Value.Default(T, {})
    Assert.deepEqual(R, { a: 1, b: 2, c: 3, d: 4 })
  })
  it('Should use default intersected deep 2', () => {
    const A = Type.Object({ a: Type.Number({}) })
    const B = Type.Object({ b: Type.Number({}) })
    const C = Type.Object({ c: Type.Number({}) })
    const D = Type.Object({ d: Type.Number({}) })
    const T1 = Type.Intersect([A, B])
    const T2 = Type.Intersect([C, D])
    const T = Type.Intersect([T1, T2])
    const R = Value.Default(T, {})
    Assert.deepEqual(R, {})
  })
})
