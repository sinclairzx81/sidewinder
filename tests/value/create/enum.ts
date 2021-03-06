import { Value } from '@sidewinder/value'
import { Type } from '@sidewinder/type'
import { Assert } from '../../assert/index'

describe('value/create/Boolean', () => {
  it('Should create value', () => {
    enum Foo {
      A,
      B,
    }
    const T = Type.Enum(Foo)
    Assert.deepEqual(Value.Create(T), Foo.A)
  })
  it('Should create default', () => {
    enum Foo {
      A,
      B,
    }
    const T = Type.Enum(Foo, { default: Foo.B })
    Assert.deepEqual(Value.Create(T), Foo.B)
  })
})
