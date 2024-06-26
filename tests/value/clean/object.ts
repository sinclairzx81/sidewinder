import { Value } from '@sidewinder/value'
import { Type } from '@sidewinder/type'
import { Assert } from '../../assert/index'

describe('value/clean/Object', () => {
  // ----------------------------------------------------------------
  // Clean
  // ----------------------------------------------------------------
  it('Should clean 1', () => {
    const T = Type.Object({ x: Type.Number() })
    const R = Value.Clean(T, null)
    Assert.deepEqual(R, null)
  })
  it('Should clean 2', () => {
    const T = Type.Object({ x: Type.Number() })
    const R = Value.Clean(T, {})
    Assert.deepEqual(R, {})
  })
  it('Should clean 3', () => {
    const T = Type.Object({ x: Type.Number() })
    const R = Value.Clean(T, { x: 1 })
    Assert.deepEqual(R, { x: 1 })
  })
  it('Should clean 4', () => {
    const T = Type.Object({ x: Type.Number() })
    const R = Value.Clean(T, { x: null })
    Assert.deepEqual(R, { x: null })
  })
  // ----------------------------------------------------------------
  // Nested
  // ----------------------------------------------------------------
  it('Should clean nested 1', () => {
    const T = Type.Object({
      x: Type.Object({
        y: Type.Number(),
      }),
    })
    const R = Value.Clean(T, null)
    Assert.deepEqual(R, null)
  })
  it('Should clean nested 2', () => {
    const T = Type.Object({
      x: Type.Object({
        y: Type.Number(),
      }),
    })
    const R = Value.Clean(T, {})
    Assert.deepEqual(R, {})
  })
  it('Should clean nested 3', () => {
    const T = Type.Object({
      x: Type.Object({
        y: Type.Number(),
      }),
    })
    const R = Value.Clean(T, { x: null })
    Assert.deepEqual(R, { x: null })
  })
  it('Should clean nested 4', () => {
    const T = Type.Object({
      x: Type.Object({
        y: Type.Number(),
      }),
    })
    const R = Value.Clean(T, { x: { y: null } })
    Assert.deepEqual(R, { x: { y: null } })
  })
  // ----------------------------------------------------------------
  // Additional Properties
  // ----------------------------------------------------------------
  it('Should clean additional properties 1', () => {
    const T = Type.Object(
      {
        x: Type.Number(),
        y: Type.Number(),
      },
      {
        additionalProperties: Type.String(),
      },
    )
    const R = Value.Clean(T, null)
    Assert.deepEqual(R, null)
  })
  it('Should clean additional properties 2', () => {
    const T = Type.Object(
      {
        x: Type.Number(),
        y: Type.Number(),
      },
      {
        additionalProperties: Type.String(),
      },
    )
    const R = Value.Clean(T, {})
    Assert.deepEqual(R, {})
  })
  it('Should clean additional properties 3', () => {
    const T = Type.Object(
      {
        x: Type.Number(),
        y: Type.Number(),
      },
      {
        additionalProperties: Type.String(),
      },
    )
    const R = Value.Clean(T, { x: 1 })
    Assert.deepEqual(R, { x: 1 })
  })
  it('Should clean additional properties 4', () => {
    const T = Type.Object(
      {
        x: Type.Number(),
        y: Type.Number(),
      },
      {
        additionalProperties: Type.String(),
      },
    )
    const R = Value.Clean(T, { x: 1, y: 2 })
    Assert.deepEqual(R, { x: 1, y: 2 })
  })
  // ----------------------------------------------------------------
  // Additional Properties Discard
  // ----------------------------------------------------------------
  it('Should clean additional properties discard 1', () => {
    const T = Type.Object(
      {
        x: Type.Number(),
        y: Type.Number(),
      },
      {
        additionalProperties: Type.String(),
      },
    )
    const R = Value.Clean(T, null)
    Assert.deepEqual(R, null)
  })
  it('Should clean additional properties discard 2', () => {
    const T = Type.Object(
      {
        x: Type.Number(),
        y: Type.Number(),
      },
      {
        additionalProperties: Type.String(),
      },
    )
    const R = Value.Clean(T, { k: '', d: null })
    Assert.deepEqual(R, { k: '' })
  })
  it('Should clean additional properties discard 3', () => {
    const T = Type.Object(
      {
        x: Type.Number(),
        y: Type.Number(),
      },
      {
        additionalProperties: Type.String(),
      },
    )
    const R = Value.Clean(T, { k: '', d: null, x: 1 })
    Assert.deepEqual(R, { k: '', x: 1 })
  })
  it('Should clean additional properties discard 4', () => {
    const T = Type.Object(
      {
        x: Type.Number(),
        y: Type.Number(),
      },
      {
        additionalProperties: Type.String(),
      },
    )
    const R = Value.Clean(T, { k: '', d: null, x: 1, y: 2 })
    Assert.deepEqual(R, { k: '', x: 1, y: 2 })
  })
})
