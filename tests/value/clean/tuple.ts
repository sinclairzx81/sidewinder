import { Value } from '@sidewinder/value'
import { Type } from '@sidewinder/type'
import { Assert } from '../../assert/index'

describe('value/clean/Tuple', () => {
  // ----------------------------------------------------------------
  // Clean
  // ----------------------------------------------------------------
  it('Should clean 1', () => {
    const T = Type.Tuple([Type.Number(), Type.Number()])
    const R = Value.Clean(T, null)
    Assert.deepEqual(R, null)
  })
  it('Should clean 2', () => {
    const T = Type.Tuple([Type.Number(), Type.Number()])
    const R = Value.Clean(T, [])
    Assert.deepEqual(R, [])
  })
  it('Should clean 3', () => {
    const T = Type.Tuple([Type.Number(), Type.Number()])
    const R = Value.Clean(T, [1, 2])
    Assert.deepEqual(R, [1, 2])
  })
  it('Should clean 4', () => {
    const T = Type.Tuple([Type.Number(), Type.Number()])
    const R = Value.Clean(T, [1, 2, 3])
    Assert.deepEqual(R, [1, 2])
  })
  // ----------------------------------------------------------------
  // Clean Deep
  // ----------------------------------------------------------------
  it('Should clean deep 1', () => {
    const T = Type.Tuple([
      Type.Number(),
      Type.Object({
        x: Type.Number(),
      }),
    ])
    const R = Value.Clean(T, null)
    Assert.deepEqual(R, null)
  })
  it('Should clean deep 2', () => {
    const T = Type.Tuple([
      Type.Number(),
      Type.Object({
        x: Type.Number(),
      }),
    ])
    const R = Value.Clean(T, [])
    Assert.deepEqual(R, [])
  })
  it('Should clean deep 3', () => {
    const T = Type.Tuple([
      Type.Number(),
      Type.Object({
        x: Type.Number(),
      }),
    ])
    const R = Value.Clean(T, [1])
    Assert.deepEqual(R, [1])
  })
  it('Should clean deep 4', () => {
    const T = Type.Tuple([
      Type.Number(),
      Type.Object({
        x: Type.Number(),
      }),
    ])
    const R = Value.Clean(T, [1, null])
    Assert.deepEqual(R, [1, null])
  })
  it('Should clean deep 5', () => {
    const T = Type.Tuple([
      Type.Number(),
      Type.Object({
        x: Type.Number(),
      }),
    ])
    const R = Value.Clean(T, [1, { x: null }])
    Assert.deepEqual(R, [1, { x: null }])
  })
  it('Should clean deep 6', () => {
    const T = Type.Tuple([
      Type.Number(),
      Type.Object({
        x: Type.Number(),
      }),
    ])
    const R = Value.Clean(T, [1, { u: null, x: null }])
    Assert.deepEqual(R, [1, { x: null }])
  })
  // ----------------------------------------------------------------
  // Clean Empty
  // ----------------------------------------------------------------
  it('Should clean empty 1', () => {
    const T = Type.Tuple([])
    const R = Value.Clean(T, null)
    Assert.deepEqual(R, null)
  })
  it('Should clean empty 2', () => {
    const T = Type.Tuple([])
    const R = Value.Clean(T, [])
    Assert.deepEqual(R, [])
  })
  it('Should clean empty 3', () => {
    const T = Type.Tuple([])
    const R = Value.Clean(T, [1])
    Assert.deepEqual(R, [])
  })
})
