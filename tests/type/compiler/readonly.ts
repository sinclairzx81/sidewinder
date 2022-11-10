import { Assert } from '../assert/index'
import { Type } from '@sidewinder/type'
import { ok, fail } from './validate'

describe('type/compiler/Readonly', () => {
  it('Should validate object with readonly', () => {
    const T = Type.Object(
      {
        a: Type.Readonly(Type.String()),
        b: Type.Readonly(Type.String()),
      },
      { additionalProperties: false },
    )
    ok(T, { a: 'hello', b: 'world' })
  })

  it('Should retain required array on object', () => {
    const T = Type.Object(
      {
        a: Type.Readonly(Type.String()),
        b: Type.Readonly(Type.String()),
      },
      { additionalProperties: false },
    )
    Assert.deepEqual(T.required!.includes('a'), true)
    Assert.deepEqual(T.required!.includes('b'), true)
  })
})
