import { Type } from '@sidewinder/type'
import { ok, fail } from './validate'

describe('type/Rec', () => {
  it('Should validate node type', () => {
    const Node = Type.Rec((Self) =>
      Type.Object(
        {
          id: Type.String(),
          nodes: Type.Array(Self),
        }
      ),
    )
    ok(Node, {
      id: 'A',
      nodes: [
        { id: 'B', nodes: [] },
        { id: 'C', nodes: [] },
      ],
    })
  })

  it('Should validate wrapped node type', () => {
    const Node = Type.Tuple([Type.Rec((Self) =>
      Type.Object(
        {
          id: Type.String(),
          nodes: Type.Array(Self),
        }
      ),
    )])
    ok(Node, [{
      id: 'A',
      nodes: [
        { id: 'B', nodes: [] },
        { id: 'C', nodes: [] },
      ],
    }])
  })
})
