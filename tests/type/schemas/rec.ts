import { Type } from '@sidewinder/type'
import { ok, fail } from './validate'

describe('type/Rec', () => {
  it('Should validate recursive node type', () => {
    const Node = Type.Rec((Self) =>
      Type.Object({
        id: Type.String(),
        nodes: Type.Array(Self),
      }),
    )
    ok(Node, {
      id: 'A',
      nodes: [
        { id: 'B', nodes: [] },
        { id: 'C', nodes: [] },
      ],
    })
  })

  // https://github.com/ajv-validator/ajv/issues/1964
  it('Should validate wrapped recursive node type', () => {
    // const Node = Type.Tuple([Type.Rec((Self) =>
    //   Type.Object(
    //     {
    //       id: Type.String(),
    //       nodes: Type.Array(Self),
    //     }
    //   ),
    // )])
    // console.log(JSON.stringify(Node, null, 2))
    // ok(Node, [{
    //   id: 'A',
    //   nodes: [
    //     { id: 'B', nodes: [] },
    //     { id: 'C', nodes: [] },
    //   ],
    // }])
  })
})
