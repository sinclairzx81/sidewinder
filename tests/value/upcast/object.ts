import { Value } from '@sidewinder/value'
import { Type } from '@sidewinder/type'
import { Assert } from '../../assert/index'

describe('value/upcast/Object', () => {
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

  it('Should upcast from string', () => {
    const value = 'hello'
    const result = Value.Upcast(T, value)
    Assert.deepEqual(result, E)
  })
  it('Should upcast from number', () => {
    const value = E
    const result = Value.Upcast(T, value)
    Assert.deepEqual(result, E)
  })
  it('Should upcast from boolean', () => {
    const value = true
    const result = Value.Upcast(T, value)
    Assert.deepEqual(result, E)
  })

  it('Should upcast from object', () => {
    const value = {}
    const result = Value.Upcast(T, value)
    Assert.deepEqual(result, E)
  })

  it('Should upcast from array', () => {
    const value = [1]
    const result = Value.Upcast(T, value)
    Assert.deepEqual(result, E)
  })

  it('Should upcast from undefined', () => {
    const value = undefined
    const result = Value.Upcast(T, value)
    Assert.deepEqual(result, E)
  })

  it('Should upcast from null', () => {
    const value = null
    const result = Value.Upcast(T, value)
    Assert.deepEqual(result, E)
  })
  it('Should preserve', () => {
    const value = { x: 7, y: 8, z: 9, a: 10, b: 11, c: 12 }
    const result = Value.Upcast(T, value)
    Assert.deepEqual(result, {
      x: 7,
      y: 8,
      z: 9,
      a: 10,
      b: 11,
      c: 12,
    })
  })
  it('Should upcast and preserve partial object', () => {
    const value = { x: 7, y: 8, z: 9 }
    const result = Value.Upcast(T, value)
    Assert.deepEqual(result, {
      x: 7,
      y: 8,
      z: 9,
      a: 'a',
      b: 'b',
      c: 'c',
    })
  })

  it('Should upcast and preserve partial object with incorrect properties', () => {
    const value = { x: true, y: 8, z: 9 }
    const result = Value.Upcast(T, value)
    Assert.deepEqual(result, {
      x: 0,
      y: 8,
      z: 9,
      a: 'a',
      b: 'b',
      c: 'c',
    })
  })

  it('Should upcast and preserve partial object and omit unknown properties', () => {
    const value = { x: 7, y: 8, z: 9, unknown: 'foo' }
    const result = Value.Upcast(T, value)
    Assert.deepEqual(result, {
      x: 7,
      y: 8,
      z: 9,
      a: 'a',
      b: 'b',
      c: 'c',
    })
  })

  it('Should upcast and preserve explicit optional property (issue #19)', () => {
    
    // -------------------------------------------------------------
    // no explicit default
    // -------------------------------------------------------------

    const T0 = Type.Object({ property: Type.Optional(Type.String())})
    const C0 = Value.Check(T0, {})
    const C1 = Value.Check(T0, { unknown: ''})
    const C2 = Value.Check(T0, { property: 'hello'})
    const C3 = Value.Check(T0, { property: 1 })
    Assert.deepEqual(C0, true)
    Assert.deepEqual(C1, true)
    Assert.deepEqual(C2, true)
    Assert.deepEqual(C3, false)

    const R2 = Value.Upcast(T0, null)
    const R3 = Value.Upcast(T0, {})
    const R4 = Value.Upcast(T0, { property: 'hello' }) // preserve
    const R5 = Value.Upcast(T0, { property: 1 })       // upcast into string

    Assert.deepEqual(R2, {})
    Assert.deepEqual(R3, {})
    Assert.deepEqual(R4, { property: 'hello' })
    Assert.deepEqual(R5, { property: '' })

    // -------------------------------------------------------------
    // explicit default
    // -------------------------------------------------------------

    const T1 = Type.Object({ property: Type.Optional(Type.String({ default: 'world' }))})
    const R6 = Value.Upcast(T1, null)
    const R7 = Value.Upcast(T1, {})
    const R8 = Value.Upcast(T1, { property: 'hello' }) // preserve
    const R9 = Value.Upcast(T1, { property: 1 })       // upcast into string

    Assert.deepEqual(R6, {})
    Assert.deepEqual(R7, {})
    Assert.deepEqual(R8, { property: 'hello' })
    Assert.deepEqual(R9, { property: 'world' })
  })
})
