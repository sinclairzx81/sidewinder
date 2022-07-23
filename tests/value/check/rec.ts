import { Value } from '@sidewinder/value'
import { Type } from '@sidewinder/type'
import { Assert } from '../../assert/index'

describe('value/check/Rec', () => {
  const T = Type.Recursive((Self) =>
    Type.Object({
      id: Type.String(),
      nodes: Type.Array(Self),
    }),
  )

  it('Should pass rec', () => {
    const value = {
      id: 'A',
      nodes: [
        { id: 'B', nodes: [] },
        { id: 'C', nodes: [] },
        { id: 'D', nodes: [] },
      ],
    }
    const result = Value.Check(T, value)
    Assert.equal(result, true)
  })

  it('Should fail rec with invalid id', () => {
    const value = {
      id: 'A',
      nodes: [
        { id: 1, nodes: [] },
        { id: 'C', nodes: [] },
        { id: 'D', nodes: [] },
      ],
    }
    const result = Value.Check(T, value)
    Assert.equal(result, false)
  })

  it('Should fail rec with invalid nodes', () => {
    const value = {
      id: 'A',
      nodes: [
        { id: 'B', nodes: 1 },
        { id: 'C', nodes: [] },
        { id: 'D', nodes: [] },
      ],
    }
    const result = Value.Check(T, value)
    Assert.equal(result, false)
  })

  it('Should fail rec with missing id', () => {
    const value = {
      id: 'A',
      nodes: [{ nodes: [] }, { id: 'C', nodes: [] }, { id: 'D', nodes: [] }],
    }
    const result = Value.Check(T, value)
    Assert.equal(result, false)
  })

  it('Should fail rec with missing nodes', () => {
    const value = {
      id: 'A',
      nodes: [{ id: 'B' }, { id: 'C', nodes: [] }, { id: 'D', nodes: [] }],
    }
    const result = Value.Check(T, value)
    Assert.equal(result, false)
  })
})
