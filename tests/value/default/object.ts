import { Value } from '@sidewinder/value'
import { Type } from '@sidewinder/type'
import { Assert } from '../../assert/index'

describe('value/default/Object', () => {
  it('Should use default', () => {
    const T = Type.Object(
      {
        x: Type.Number(),
        y: Type.Number(),
      },
      { default: 1 },
    )
    const R = Value.Default(T, undefined)
    Assert.deepEqual(R, 1)
  })
  it('Should use value', () => {
    const T = Type.Object(
      {
        x: Type.Number(),
        y: Type.Number(),
      },
      { default: 1 },
    )
    const R = Value.Default(T, null)
    Assert.deepEqual(R, null)
  })
  // ----------------------------------------------------------------
  // Construction
  // ----------------------------------------------------------------
  it('Should should fully construct object 1', () => {
    const T = Type.Object(
      {
        x: Type.Object(
          {
            x: Type.Number({ default: 1 }),
            y: Type.Number({ default: 2 }),
          },
          { default: {} },
        ),
        y: Type.Object(
          {
            x: Type.Number({ default: 3 }),
            y: Type.Number({ default: 4 }),
          },
          { default: {} },
        ),
      },
      { default: {} },
    )
    const R = Value.Default(T, undefined)
    Assert.deepEqual(R, { x: { x: 1, y: 2 }, y: { x: 3, y: 4 } })
  })
  it('Should should fully construct object 2', () => {
    const T = Type.Object(
      {
        x: Type.Object(
          {
            x: Type.Number({ default: 1 }),
            y: Type.Number({ default: 2 }),
          },
          { default: {} },
        ),
        y: Type.Object(
          {
            x: Type.Number({ default: 3 }),
            y: Type.Number({ default: 4 }),
          },
          { default: {} },
        ),
      },
      { default: {} },
    )
    const R = Value.Default(T, { x: null })
    Assert.deepEqual(R, { x: null, y: { x: 3, y: 4 } })
  })
  it('Should should fully construct object 3', () => {
    const T = Type.Object(
      {
        x: Type.Object(
          {
            x: Type.Number({ default: 1 }),
            y: Type.Number({ default: 2 }),
          },
          { default: {} },
        ),
        y: Type.Object(
          {
            x: Type.Number({ default: 3 }),
            y: Type.Number({ default: 4 }),
          },
          { default: {} },
        ),
      },
      { default: {} },
    )
    const R = Value.Default(T, { x: { x: null, y: null } })
    Assert.deepEqual(R, { x: { x: null, y: null }, y: { x: 3, y: 4 } })
  })
  // ----------------------------------------------------------------
  // Properties
  // ----------------------------------------------------------------
  it('Should use property defaults 1', () => {
    const T = Type.Object(
      {
        x: Type.Number({ default: 1 }),
        y: Type.Number({ default: 2 }),
      },
      { default: 1 },
    )
    const R = Value.Default(T, {})
    Assert.deepEqual(R, { x: 1, y: 2 })
  })
  it('Should use property defaults 2', () => {
    const T = Type.Object({
      x: Type.Number(),
      y: Type.Number(),
    })
    const R = Value.Default(T, {})
    Assert.deepEqual(R, {})
  })
  it('Should use property defaults 3', () => {
    const T = Type.Object({
      x: Type.Number({ default: 1 }),
      y: Type.Number(),
    })
    const R = Value.Default(T, {})
    Assert.deepEqual(R, { x: 1 })
  })
  it('Should use property defaults 4', () => {
    const T = Type.Object({
      x: Type.Number({ default: 1 }),
      y: Type.Number(),
    })
    const R = Value.Default(T, { x: 3 })
    Assert.deepEqual(R, { x: 3 })
  })
  // ----------------------------------------------------------------
  // AdditionalProperties
  // ----------------------------------------------------------------
  it('Should use additional property defaults 1', () => {
    const T = Type.Object(
      {
        x: Type.Number({ default: 1 }),
        y: Type.Number({ default: 2 }),
      },
      {
        additionalProperties: Type.Number({ default: 3 }),
      },
    )
    const R = Value.Default(T, {})
    Assert.deepEqual(R, { x: 1, y: 2 })
  })
  it('Should use additional property defaults 2', () => {
    const T = Type.Object(
      {
        x: Type.Number({ default: 1 }),
        y: Type.Number({ default: 2 }),
      },
      {
        additionalProperties: Type.Number({ default: 3 }),
      },
    )
    const R = Value.Default(T, { x: null, y: null, z: undefined })
    Assert.deepEqual(R, { x: null, y: null, z: 3 })
  })
  it('Should use additional property defaults 3', () => {
    const T = Type.Object(
      {
        x: Type.Number({ default: 1 }),
        y: Type.Number({ default: 2 }),
      },
      {
        additionalProperties: Type.Number(),
      },
    )
    const R = Value.Default(T, { x: null, y: null, z: undefined })
    Assert.deepEqual(R, { x: null, y: null, z: undefined })
  })
  // ----------------------------------------------------------------
  // Mutation
  // ----------------------------------------------------------------
  // https://github.com/sinclairzx81/typebox/issues/726
  it('Should retain defaults on operation', () => {
    const A = Type.Object({
      a: Type.Object(
        {
          b: Type.Array(Type.String(), { default: [] }),
        },
        { default: {} },
      ),
    })
    const value = Value.Default(A, {})
    Assert.deepEqual(value, { a: { b: [] } })
    Assert.deepEqual(A.properties.a.default, {})
    Assert.deepEqual(A.properties.a.properties.b.default, [])
  })
})
