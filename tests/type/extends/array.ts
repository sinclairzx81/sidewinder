import { Type, Extends, ExtendsResult } from '@sidewinder/type'
import { Assert } from '../../assert/index'

describe('type/extends/Array', () => {
  it('Should extend Any', () => {
    type T = Array<any> extends any ? 1 : 2
    const R = Extends.Check(Type.Array(Type.Any()), Type.Any())
    Assert.deepEqual(R, ExtendsResult.True)
  })

  it('Should extend String', () => {
    type T = Array<any> extends string ? 1 : 2
    const R = Extends.Check(Type.Array(Type.Any()), Type.String())
    Assert.deepEqual(R, ExtendsResult.False)
  })

  it('Should extend Boolean', () => {
    type T = Array<any> extends boolean ? 1 : 2
    const R = Extends.Check(Type.Array(Type.Any()), Type.Boolean())
    Assert.deepEqual(R, ExtendsResult.False)
  })

  it('Should extend Number', () => {
    type T = Array<any> extends number ? 1 : 2
    const R = Extends.Check(Type.Array(Type.Any()), Type.Number())
    Assert.deepEqual(R, ExtendsResult.False)
  })

  it('Should extend Integer', () => {
    type T = Array<any> extends number ? 1 : 2
    const R = Extends.Check(Type.Array(Type.Any()), Type.Integer())
    Assert.deepEqual(R, ExtendsResult.False)
  })

  it('Should extend Array 1', () => {
    type T = Array<any> extends Array<any> ? 1 : 2
    const R = Extends.Check(Type.Array(Type.Any()), Type.Array(Type.Any()))
    Assert.deepEqual(R, ExtendsResult.True)
  })

  it('Should extend Array 2', () => {
    type T = Array<string> extends Array<any> ? 1 : 2
    const R = Extends.Check(Type.Array(Type.Any()), Type.Array(Type.Any()))
    Assert.deepEqual(R, ExtendsResult.True)
  })

  it('Should extend Array 3', () => {
    type T = Array<any> extends Array<string> ? 1 : 2
    const R = Extends.Check(Type.Array(Type.Any()), Type.Array(Type.Any()))
    Assert.deepEqual(R, ExtendsResult.True)
  })

  it('Should extend Tuple', () => {
    type T = Array<any> extends [number, number] ? 1 : 2
    const R = Extends.Check(Type.Array(Type.Any()), Type.Tuple([Type.Number(), Type.Number()]))
    Assert.deepEqual(R, ExtendsResult.False)
  })

  it('Should extend Object 1', () => {
    type T = Array<any> extends object ? 1 : 2
    const R = Extends.Check(Type.Array(Type.Any()), Type.Object({}))
    Assert.deepEqual(R, ExtendsResult.True)
  })

  it('Should extend Object 2', () => {
    type T = Array<any> extends {} ? 1 : 2
    const R = Extends.Check(Type.Array(Type.Any()), Type.Object({}))
    Assert.deepEqual(R, ExtendsResult.True)
  })

  it('Should extend Object 3', () => {
    type T = Array<any> extends { a: number } ? 1 : 2
    const R = Extends.Check(Type.Array(Type.Any()), Type.Object({ a: Type.Number() }))
    Assert.deepEqual(R, ExtendsResult.False)
  })

  it('Should extend Object 4', () => {
    type T = Array<any> extends { length: '1' } ? 1 : 2
    const R = Extends.Check(Type.Array(Type.Any()), Type.Object({ length: Type.Literal('1') }))
    Assert.deepEqual(R, ExtendsResult.False)
  })

  it('Should extend Object 5', () => {
    type T = Array<any> extends { length: number } ? 1 : 2
    const R = Extends.Check(Type.Array(Type.Any()), Type.Object({ length: Type.Number() }))
    Assert.deepEqual(R, ExtendsResult.True)
  })

  it('Should extend Union 1', () => {
    type T = Array<any> extends number | string ? 1 : 2
    const R = Extends.Check(Type.Array(Type.Any()), Type.Union([Type.Null(), Type.String()]))
    Assert.deepEqual(R, ExtendsResult.False)
  })

  it('Should extend Union 2', () => {
    type T = Array<any> extends any | number ? 1 : 2
    const R = Extends.Check(Type.Array(Type.Any()), Type.Union([Type.Any(), Type.String()]))
    Assert.deepEqual(R, ExtendsResult.True)
  })

  it('Should extend Union 3', () => {
    type T = Array<any> extends any | Array<any> ? 1 : 2
    const R = Extends.Check(Type.Array(Type.Any()), Type.Union([Type.Any(), Type.Array(Type.Any())]))
    Assert.deepEqual(R, ExtendsResult.True)
  })

  it('Should extend Union 4', () => {
    type T = Array<string> extends any | Array<any> ? 1 : 2
    const R = Extends.Check(Type.Array(Type.String()), Type.Union([Type.Any(), Type.Array(Type.Any())]))
    Assert.deepEqual(R, ExtendsResult.True)
  })

  it('Should extend Union 5', () => {
    type T = Array<any> extends any | Array<string> ? 1 : 2
    const R = Extends.Check(Type.Array(Type.Any()), Type.Union([Type.Any(), Type.Array(Type.String())]))
    Assert.deepEqual(R, ExtendsResult.True)
  })

  it('Should extend Null', () => {
    type T = Array<any> extends null ? 1 : 2
    const R = Extends.Check(Type.Array(Type.Any()), Type.Null())
    Assert.deepEqual(R, ExtendsResult.False)
  })

  it('Should extend Undefined', () => {
    type T = Array<any> extends undefined ? 1 : 2
    const R = Extends.Check(Type.Array(Type.Any()), Type.Undefined())
    Assert.deepEqual(R, ExtendsResult.False)
  })
})
