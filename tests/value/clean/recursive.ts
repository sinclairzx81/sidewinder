import { Value } from '@sidewinder/value'
import { Type } from '@sidewinder/type'
import { Assert } from '../../assert/index'

describe('value/clean/Recursive', () => {
  // ----------------------------------------------------------------
  // Clean
  // ----------------------------------------------------------------
  it('Should clean 1', () => {
    const T = Type.Recursive((This) =>
      Type.Object({
        id: Type.String(),
        nodes: Type.Array(This),
      }),
    )
    const R = Value.Clean(T, null)
    Assert.deepEqual(R, null)
  })
  it('Should clean 2', () => {
    const T = Type.Recursive((This) =>
      Type.Object({
        id: Type.String(),
        nodes: Type.Array(This),
      }),
    )
    const R = Value.Clean(T, { id: null })
    Assert.deepEqual(R, { id: null })
  })
  it('Should clean 3', () => {
    const T = Type.Recursive((This) =>
      Type.Object({
        id: Type.String(),
        nodes: Type.Array(This),
      }),
    )
    const R = Value.Clean(T, { id: null, nodes: null })
    Assert.deepEqual(R, { id: null, nodes: null })
  })
  it('Should clean 4', () => {
    const T = Type.Recursive((This) =>
      Type.Object({
        id: Type.String(),
        nodes: Type.Array(This),
      }),
    )
    const R = Value.Clean(T, { id: null, nodes: [] })
    Assert.deepEqual(R, { id: null, nodes: [] })
  })
  it('Should clean 5', () => {
    const T = Type.Recursive((This) =>
      Type.Object({
        id: Type.String(),
        nodes: Type.Array(This),
      }),
    )
    const R = Value.Clean(T, { id: null, nodes: [{ id: null }] })
    Assert.deepEqual(R, { id: null, nodes: [{ id: null }] })
  })
  // ----------------------------------------------------------------
  // Clean Discard
  // ----------------------------------------------------------------
  it('Should clean discard 1', () => {
    const T = Type.Recursive((This) =>
      Type.Object({
        id: Type.String(),
        nodes: Type.Array(This),
      }),
    )
    const R = Value.Clean(T, null)
    Assert.deepEqual(R, null)
  })
  it('Should clean discard 2', () => {
    const T = Type.Recursive((This) =>
      Type.Object({
        id: Type.String(),
        nodes: Type.Array(This),
      }),
    )
    const R = Value.Clean(T, { u: null, id: null })
    Assert.deepEqual(R, { id: null })
  })
  it('Should clean discard 3', () => {
    const T = Type.Recursive((This) =>
      Type.Object({
        id: Type.String(),
        nodes: Type.Array(This),
      }),
    )
    const R = Value.Clean(T, { u: null, id: null, nodes: null })
    Assert.deepEqual(R, { id: null, nodes: null })
  })
  it('Should clean discard 4', () => {
    const T = Type.Recursive((This) =>
      Type.Object({
        id: Type.String(),
        nodes: Type.Array(This),
      }),
    )
    const R = Value.Clean(T, { u: null, id: null, nodes: [] })
    Assert.deepEqual(R, { id: null, nodes: [] })
  })
  // it('Should clean discard 5', () => {
  //   const T = Type.Recursive((This) =>
  //     Type.Object({
  //       id: Type.String(),
  //       nodes: Type.Array(This),
  //     }),
  //   )
  //   const R = Value.Clean(T, { u: null, id: null, nodes: [{ u: null, id: null }] })
  //   Assert.deepEqual(R, { id: null, nodes: [{ id: null }] })
  // })
})
