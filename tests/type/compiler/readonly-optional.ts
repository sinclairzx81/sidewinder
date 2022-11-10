import { Type } from '@sidewinder/type'
import { ok } from './validate'
import { Assert } from '../assert/index'

describe('type/compiler/ReadonlyOptional', () => {
  it('Should validate object with optional', () => {
    const T = Type.Object(
      {
        a: Type.ReadonlyOptional(Type.String()),
        b: Type.String(),
      },
      { additionalProperties: false },
    )
    ok(T, { a: 'hello', b: 'world' })
    ok(T, { b: 'world' })
  })
  it('Should remove required value from schema', () => {
    const T = Type.Object(
      {
        a: Type.ReadonlyOptional(Type.String()),
        b: Type.String(),
      },
      { additionalProperties: false },
    )
    Assert.deepEqual(T.required!.includes('a'), false)
  })
})
