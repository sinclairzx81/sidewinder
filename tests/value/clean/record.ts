import { Value } from '@sidewinder/value'
import { Type } from '@sidewinder/type'
import { Assert } from '../../assert/index'

describe('value/clean/Record', () => {
  // ----------------------------------------------------------------
  // Clean
  // ----------------------------------------------------------------
  it('Should clean 1', () => {
    const T = Type.Record(Type.Number(), Type.String())
    const R = Value.Clean(T, null)
    Assert.deepEqual(R, null)
  })
  it('Should clean 2', () => {
    const T = Type.Record(Type.Number(), Type.String())
    const R = Value.Clean(T, {})
    Assert.deepEqual(R, {})
  })
  it('Should clean 3', () => {
    const T = Type.Record(Type.Number(), Type.String())
    const R = Value.Clean(T, { 0: null })
    Assert.deepEqual(R, { 0: null })
  })
  // ----------------------------------------------------------------
  // Clean Discard
  // ----------------------------------------------------------------
  it('Should clean discard 1', () => {
    const T = Type.Record(Type.Number(), Type.String())
    const R = Value.Clean(T, null)
    Assert.deepEqual(R, null)
  })
  it('Should clean discard 2', () => {
    const T = Type.Record(Type.Number(), Type.String())
    const R = Value.Clean(T, { a: 1 })
    Assert.deepEqual(R, {})
  })
  it('Should clean discard 3', () => {
    const T = Type.Record(Type.Number(), Type.String())
    const R = Value.Clean(T, { a: 1, 0: null })
    Assert.deepEqual(R, { 0: null })
  })
  // ----------------------------------------------------------------
  // Additional Properties
  // ----------------------------------------------------------------
  it('Should clean additional properties 1', () => {
    const T = Type.Record(Type.Number(), Type.String(), {
      additionalProperties: Type.Boolean(),
    })
    const R = Value.Clean(T, null)
    Assert.deepEqual(R, null)
  })
  it('Should clean additional properties 2', () => {
    const T = Type.Record(Type.Number(), Type.String(), {
      additionalProperties: Type.Boolean(),
    })
    const R = Value.Clean(T, {})
    Assert.deepEqual(R, {})
  })
  it('Should clean additional properties 3', () => {
    const T = Type.Record(Type.Number(), Type.String(), {
      additionalProperties: Type.Boolean(),
    })
    const R = Value.Clean(T, { 0: null })
    Assert.deepEqual(R, { 0: null })
  })
  // ----------------------------------------------------------------
  // Additional Properties Discard
  // ----------------------------------------------------------------
  it('Should clean additional properties discard 1', () => {
    const T = Type.Record(Type.Number(), Type.String(), {
      additionalProperties: Type.Boolean(),
    })
    const R = Value.Clean(T, null)
    Assert.deepEqual(R, null)
  })
  it('Should clean additional properties discard 2', () => {
    const T = Type.Record(Type.Number(), Type.String(), {
      additionalProperties: Type.Boolean(),
    })
    const R = Value.Clean(T, { a: null })
    Assert.deepEqual(R, {})
  })
  it('Should clean additional properties discard 3', () => {
    const T = Type.Record(Type.Number(), Type.String(), {
      additionalProperties: Type.Boolean(),
    })
    const R = Value.Clean(T, { a: null, 0: null })
    Assert.deepEqual(R, { 0: null })
  })
  // ----------------------------------------------------------------
  // Additional Properties Keep
  // ----------------------------------------------------------------
  it('Should clean additional properties keep 1', () => {
    const T = Type.Record(Type.Number(), Type.String(), {
      additionalProperties: Type.Boolean(),
    })
    const R = Value.Clean(T, null)
    Assert.deepEqual(R, null)
  })
  // it('Should clean additional properties keep 2', () => {
  //   const T = Type.Record(Type.Number(), Type.String(), {
  //     additionalProperties: Type.Boolean(),
  //   })
  //   const R = Value.Clean(T, { a: true })
  //   Assert.deepEqual(R, { a: true })
  // })
  // it('Should clean additional properties keep 3', () => {
  //   const T = Type.Record(Type.Number(), Type.String(), {
  //     additionalProperties: Type.Boolean(),
  //   })
  //   const R = Value.Clean(T, { a: true, 0: null })
  //   Assert.deepEqual(R, { a: true, 0: null })
  // })
})
