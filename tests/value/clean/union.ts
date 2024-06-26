import { Value } from '@sidewinder/value'
import { Type } from '@sidewinder/type'
import { Assert } from '../../assert/index'

describe('value/clean/Union', () => {
  // ----------------------------------------------------------------
  // Clean
  // ----------------------------------------------------------------
  it('Should clean 1', () => {
    const T = Type.Union([Type.Number(), Type.Boolean()])
    const R = Value.Clean(T, null)
    Assert.deepEqual(R, null)
  })
  it('Should clean 2', () => {
    const T = Type.Union([Type.Number(), Type.Boolean()])
    const R = Value.Clean(T, 1)
    Assert.deepEqual(R, 1)
  })
  it('Should clean 2', () => {
    const T = Type.Union([Type.Number(), Type.Boolean()])
    const R = Value.Clean(T, true)
    Assert.deepEqual(R, true)
  })
  // ----------------------------------------------------------------
  // Clean Select
  // ----------------------------------------------------------------
  it('Should clean select 1', () => {
    const X = Type.Object({ x: Type.Number() })
    const Y = Type.Object({ y: Type.Number() })
    const T = Type.Union([X, Y])
    const R = Value.Clean(T, null)
    Assert.deepEqual(R, null)
  })
  it('Should clean select 2', () => {
    const X = Type.Object({ x: Type.Number() })
    const Y = Type.Object({ y: Type.Number() })
    const T = Type.Union([X, Y])
    const R = Value.Clean(T, {})
    Assert.deepEqual(R, {})
  })
  it('Should clean select 3', () => {
    const X = Type.Object({ x: Type.Number() })
    const Y = Type.Object({ y: Type.Number() })
    const T = Type.Union([X, Y])
    const R = Value.Clean(T, { x: null })
    Assert.deepEqual(R, { x: null })
  })
  it('Should clean select 4', () => {
    const X = Type.Object({ x: Type.Number() })
    const Y = Type.Object({ y: Type.Number() })
    const T = Type.Union([X, Y])
    const R = Value.Clean(T, { y: null })
    Assert.deepEqual(R, { y: null })
  })
  // ----------------------------------------------------------------
  // Clean Select Discard
  // ----------------------------------------------------------------
  it('Should clean select discard 1', () => {
    const X = Type.Object({ x: Type.Number() })
    const Y = Type.Object({ y: Type.Number() })
    const T = Type.Union([X, Y])
    const R = Value.Clean(T, null)
    Assert.deepEqual(R, null)
  })
  it('Should clean select discard 2', () => {
    const X = Type.Object({ x: Type.Number() })
    const Y = Type.Object({ y: Type.Number() })
    const T = Type.Union([X, Y])
    const R = Value.Clean(T, { u: null })
    Assert.deepEqual(R, { u: null }) // no match
  })
  it('Should clean select discard 3', () => {
    const X = Type.Object({ x: Type.Number() })
    const Y = Type.Object({ y: Type.Number() })
    const T = Type.Union([X, Y])
    const R = Value.Clean(T, { u: null, x: 1 })
    Assert.deepEqual(R, { x: 1 })
  })
  it('Should clean select discard 4', () => {
    const X = Type.Object({ x: Type.Number() })
    const Y = Type.Object({ y: Type.Number() })
    const T = Type.Union([X, Y])
    const R = Value.Clean(T, { u: null, y: 1 })
    Assert.deepEqual(R, { y: 1 })
  })
  // ----------------------------------------------------------------
  // Clean Select Retain
  // ----------------------------------------------------------------
  it('Should clean select retain 1', () => {
    const X = Type.Object({ x: Type.Number() }, { additionalProperties: Type.Null() })
    const Y = Type.Object({ y: Type.Number() }, { additionalProperties: Type.Null() })
    const T = Type.Union([X, Y])
    const R = Value.Clean(T, null)
    Assert.deepEqual(R, null)
  })
  it('Should clean select retain 2', () => {
    const X = Type.Object({ x: Type.Number() }, { additionalProperties: Type.Null() })
    const Y = Type.Object({ y: Type.Number() }, { additionalProperties: Type.Null() })
    const T = Type.Union([X, Y])
    const R = Value.Clean(T, { u: null })
    Assert.deepEqual(R, { u: null })
  })
  it('Should clean select retain 3', () => {
    const X = Type.Object({ x: Type.Number() }, { additionalProperties: Type.Null() })
    const Y = Type.Object({ y: Type.Number() }, { additionalProperties: Type.Null() })
    const T = Type.Union([X, Y])
    const R = Value.Clean(T, { u: null, x: 1 })
    Assert.deepEqual(R, { u: null, x: 1 })
  })
  it('Should clean select retain 4', () => {
    const X = Type.Object({ x: Type.Number() }, { additionalProperties: Type.Null() })
    const Y = Type.Object({ y: Type.Number() }, { additionalProperties: Type.Null() })
    const T = Type.Union([X, Y])
    const R = Value.Clean(T, { u: null, y: 1 })
    Assert.deepEqual(R, { u: null, y: 1 })
  })
  // ----------------------------------------------------------------
  // Clean Select First and Discard
  // ----------------------------------------------------------------
  it('Should clean select first and discard 1', () => {
    const X = Type.Object({ x: Type.Number() })
    const Y = Type.Object({ y: Type.Number() }, { additionalProperties: Type.Null() })
    const T = Type.Union([X, Y])
    const R = Value.Clean(T, { u: null, x: 1 })
    Assert.deepEqual(R, { x: 1 })
  })
  it('Should clean select first and discard 2', () => {
    const X = Type.Object({ x: Type.Number() })
    const Y = Type.Object({ y: Type.Number() }, { additionalProperties: Type.Null() })
    const T = Type.Union([X, Y])
    const R = Value.Clean(T, { u: null, y: 1 })
    Assert.deepEqual(R, { u: null, y: 1 })
  })
  // ----------------------------------------------------------------
  // Union Recursive
  //
  // https://github.com/sinclairzx81/typebox/issues/845
  // ----------------------------------------------------------------
  // it('Should clean recursive with union', () => {
  //   const T = Type.Recursive((This) =>
  //     Type.Object({
  //       id: Type.Number(),
  //       parent: Type.Union([This, Type.Null()]),
  //     }),
  //   )
  //   const R = Value.Clean(T, {
  //     id: 1,
  //     unknown: 1,
  //     parent: {
  //       id: 2,
  //       unknown: 1,
  //       parent: null,
  //     },
  //   })
  //   Assert.deepEqual(R, { id: 1, parent: { id: 2, parent: null } })
  // })
})
