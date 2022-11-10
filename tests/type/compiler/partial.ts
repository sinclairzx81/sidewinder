import { Type, Modifier } from '@sidewinder/type'
import { ok, fail } from './validate'
import { Assert } from '../assert/index'

describe('type/compiler/Partial', () => {
  it('Should convert a required object into a partial.', () => {
    const A = Type.Object(
      {
        x: Type.Number(),
        y: Type.Number(),
        z: Type.Number(),
      },
      { additionalProperties: false },
    )
    const T = Type.Partial(A)
    ok(T, { x: 1, y: 1, z: 1 })
    ok(T, { x: 1, y: 1 })
    ok(T, { x: 1 })
    ok(T, {})
  })

  it('Should update modifier types correctly when converting to partial', () => {
    const A = Type.Object(
      {
        x: Type.ReadonlyOptional(Type.Number()),
        y: Type.Readonly(Type.Number()),
        z: Type.Optional(Type.Number()),
        w: Type.Number(),
      },
      { additionalProperties: false },
    )
    const T = Type.Partial(A)
    Assert.deepEqual(T.properties.x[Modifier], 'ReadonlyOptional')
    Assert.deepEqual(T.properties.y[Modifier], 'ReadonlyOptional')
    Assert.deepEqual(T.properties.z[Modifier], 'Optional')
    Assert.deepEqual(T.properties.w[Modifier], 'Optional')
  })

  it('Should inherit options from the source object', () => {
    const A = Type.Object(
      {
        x: Type.Number(),
        y: Type.Number(),
        z: Type.Number(),
      },
      { additionalProperties: false },
    )
    const T = Type.Partial(A)
    Assert.deepEqual(A.additionalProperties, false)
    Assert.deepEqual(T.additionalProperties, false)
  })
})
