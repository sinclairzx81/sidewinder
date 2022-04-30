import { Type, Extends, ExtendsResult } from '@sidewinder/type'
import { Assert } from '../../assert/index'

describe('type/extends/Boolean', () => {
  it('Should extend Any', () => {
    type T = boolean extends any ? 1 : 2
    const R = Extends.Check(Type.Boolean(), Type.Any())
    Assert.deepEqual(R, ExtendsResult.True)
  })

  it('Should extend String', () => {
    type T = boolean extends string ? 1 : 2
    const R = Extends.Check(Type.Boolean(), Type.String())
    Assert.deepEqual(R, ExtendsResult.False)
  })

  it('Should extend Boolean', () => {
    type T = boolean extends boolean ? 1 : 2
    const R = Extends.Check(Type.Boolean(), Type.Boolean())
    Assert.deepEqual(R, ExtendsResult.True)
  })

  it('Should extend Number', () => {
    type T = boolean extends number ? 1 : 2
    const R = Extends.Check(Type.Boolean(), Type.Number())
    Assert.deepEqual(R, ExtendsResult.False)
  })

  it('Should extend Integer', () => {
    type T = boolean extends number ? 1 : 2
    const R = Extends.Check(Type.Boolean(), Type.Integer())
    Assert.deepEqual(R, ExtendsResult.False)
  })

  it('Should extend Array', () => {
    type T = boolean extends Array<any> ? 1 : 2
    const R = Extends.Check(Type.Boolean(), Type.Array(Type.Any()))
    Assert.deepEqual(R, ExtendsResult.False)
  })

  it('Should extend Tuple', () => {
    type T = boolean extends [number, number] ? 1 : 2
    const R = Extends.Check(Type.Boolean(), Type.Tuple([Type.Number(), Type.Number()]))
    Assert.deepEqual(R, ExtendsResult.False)
  })

  it('Should extend Object 1', () => {
    type T = boolean extends {} ? 1 : 2
    const R = Extends.Check(Type.Boolean(), Type.Object({}, { additionalProperties: false }))
    Assert.deepEqual(R, ExtendsResult.True)
  })

  it('Should extend Object 2', () => {
    type T = boolean extends { a: 10 } ? 1 : 2
    const R = Extends.Check(Type.Boolean(), Type.Object({ a: Type.Literal(10) }, { additionalProperties: true }))
    Assert.deepEqual(R, ExtendsResult.False)
  })

  it('Should extend Object 3', () => {
    type T = boolean extends object ? 1 : 2
    const R = Extends.Check(Type.Boolean(), Type.Object({}))
    Assert.deepEqual(R, ExtendsResult.False)
  })

  it('Should extend Union 1', () => {
    type T = boolean extends number | string ? 1 : 2
    const R = Extends.Check(Type.Boolean(), Type.Union([Type.Number(), Type.String()]))
    Assert.deepEqual(R, ExtendsResult.False)
  })

  it('Should extend Union 2', () => {
    type T = boolean extends any | number ? 1 : 2
    const R = Extends.Check(Type.Boolean(), Type.Union([Type.Any(), Type.Number()]))
    Assert.deepEqual(R, ExtendsResult.True)
  })

  it('Should extend Union 2', () => {
    type T = boolean extends boolean | number ? 1 : 2
    const R = Extends.Check(Type.Boolean(), Type.Union([Type.Boolean(), Type.Number()]))
    Assert.deepEqual(R, ExtendsResult.True)
  })

  it('Should extend Null', () => {
    type T = boolean extends null ? 1 : 2
    const R = Extends.Check(Type.Boolean(), Type.Null())
    Assert.deepEqual(R, ExtendsResult.False)
  })

  it('Should extend Undefined', () => {
    type T = boolean extends undefined ? 1 : 2
    const R = Extends.Check(Type.Boolean(), Type.Undefined())
    Assert.deepEqual(R, ExtendsResult.False)
  })
})
