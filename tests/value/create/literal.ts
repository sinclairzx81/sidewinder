import { Value } from '@sidewinder/value'
import { Type } from '@sidewinder/type'
import { Assert } from '../../assert/index'

describe('value/create/KeyOf', () => {
  it('Should create literal string', () => {
    const T = Type.Literal('hello')
    Assert.deepEqual(Value.Create(T), 'hello')
  })
  it('Should create literal number', () => {
    const T = Type.Literal(1)
    Assert.deepEqual(Value.Create(T), 1)
  })
  it('Should create literal boolean', () => {
    const T = Type.Literal(true)
    Assert.deepEqual(Value.Create(T), true)
  })
})
