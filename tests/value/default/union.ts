import { Value } from '@sidewinder/value'
import { Type } from '@sidewinder/type'
import { Assert } from '../../assert/index'

describe('value/default/Union', () => {
  it('Should use default', () => {
    const T = Type.Union([Type.Number(), Type.String()], { default: 1 })
    const R = Value.Default(T, undefined)
    Assert.deepEqual(R, 1)
  })
  it('Should use value', () => {
    const T = Type.Union([Type.Number(), Type.String()], { default: 1 })
    const R = Value.Default(T, null)
    Assert.deepEqual(R, null)
  })
  // ----------------------------------------------------------------
  // Interior
  // ----------------------------------------------------------------
  it('Should default interior 1', () => {
    const T = Type.Union([
      Type.Object({
        x: Type.Number({ default: 1 }),
        y: Type.Number({ default: 2 }),
      }),
      Type.String({ default: 'hello' }),
    ])
    const R = Value.Default(T, null)
    Assert.deepEqual(R, null)
  })
  it('Should default interior 2', () => {
    const T = Type.Union([
      Type.Object({
        x: Type.Number({ default: 1 }),
        y: Type.Number({ default: 2 }),
      }),
      Type.String({ default: 'hello' }),
    ])
    const R = Value.Default(T, undefined)
    Assert.deepEqual(R, 'hello')
  })
  it('Should default interior 3', () => {
    const T = Type.Union([
      Type.Object({
        x: Type.Number({ default: 1 }),
        y: Type.Number({ default: 2 }),
      }),
      Type.String({ default: 'hello' }),
    ])
    const R = Value.Default(T, 'world')
    Assert.deepEqual(R, 'world')
  })
  it('Should default interior 4', () => {
    const T = Type.Union([
      Type.Object({
        x: Type.Number({ default: 1 }),
        y: Type.Number({ default: 2 }),
      }),
      Type.String({ default: 'hello' }),
    ])
    const R = Value.Default(T, {})
    Assert.deepEqual(R, { x: 1, y: 2 })
  })
  it('Should default interior 5', () => {
    const T = Type.Union([
      Type.Object({
        x: Type.Number({ default: 1 }),
        y: Type.Number({ default: 2 }),
      }),
      Type.String({ default: 'hello' }),
    ])
    const R = Value.Default(T, { x: 3 })
    Assert.deepEqual(R, { x: 3, y: 2 })
  })
  it('Should default interior 6', () => {
    const T = Type.Union([
      Type.Object({
        x: Type.Number({ default: 1 }),
        y: Type.Number({ default: 2 }),
      }),
      Type.String({ default: 'hello' }),
    ])
    const R = Value.Default(T, { x: 3, y: 4 })
    Assert.deepEqual(R, { x: 3, y: 4 })
  })
  // ----------------------------------------------------------------
  // Interior Unsafe
  // ----------------------------------------------------------------
  it('Should default interior unsafe 1', () => {
    const T = Type.Union([
      Type.Object({
        x: Type.Number({ default: 1 }),
        y: Type.Number({ default: 2 }),
      }),
      Type.Unsafe({ default: 'hello' }),
    ])
    const R = Value.Default(T, undefined)
    Assert.deepEqual(R, undefined)
  })
  it('Should default interior unsafe 2', () => {
    const T = Type.Union([
      Type.Object({
        x: Type.Number({ default: 1 }),
        y: Type.Number({ default: 2 }),
      }),
      Type.Unsafe({ default: 'hello' }),
    ])
    const R = Value.Default(T, 'world')
    Assert.deepEqual(R, 'world')
  })
})
