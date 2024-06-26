import { Value } from '@sidewinder/value'
import { Type } from '@sidewinder/type'
import { Assert } from '../../assert/index'

describe('value/default/Tuple', () => {
  it('Should use default', () => {
    const T = Type.Tuple([Type.Number(), Type.Number()], { default: 1 })
    const R = Value.Default(T, undefined)
    Assert.deepEqual(R, 1)
  })
  it('Should use value', () => {
    const T = Type.Tuple([Type.Number(), Type.Number()], { default: 1 })
    const R = Value.Default(T, null)
    Assert.deepEqual(R, null)
  })
  // ----------------------------------------------------------------
  // Elements
  // ----------------------------------------------------------------
  it('Should use default elements 1', () => {
    const T = Type.Tuple([Type.Number({ default: 1 }), Type.Number({ default: 2 })], { default: [] })
    const R = Value.Default(T, null)
    Assert.deepEqual(R, null)
  })
  it('Should use default elements 2', () => {
    const T = Type.Tuple([Type.Number({ default: 1 }), Type.Number({ default: 2 })], { default: [] })
    const R = Value.Default(T, undefined)
    Assert.deepEqual(R, [1, 2])
  })
  it('Should use default elements 3', () => {
    const T = Type.Tuple([Type.Number({ default: 1 }), Type.Number({ default: 2 })], { default: [] })
    const R = Value.Default(T, [4, 5, 6])
    Assert.deepEqual(R, [4, 5, 6])
  })
  it('Should use default elements 4', () => {
    const T = Type.Tuple([Type.Number({ default: 1 }), Type.Number({ default: 2 })])
    const R = Value.Default(T, [4, 5, 6])
    Assert.deepEqual(R, [4, 5, 6])
  })
  it('Should use default elements 5', () => {
    const T = Type.Tuple([Type.Number({ default: 1 }), Type.Number({ default: 2 })])
    const R = Value.Default(T, [4])
    Assert.deepEqual(R, [4, 2])
  })
})
