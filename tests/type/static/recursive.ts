import { Expect } from './assert'
import { Type, Static } from '@sidewinder/type'

{
  const T = Type.Recursive((Node) =>
    Type.Object({
      id: Type.String(),
      nodes: Type.Array(Node),
    }),
  )

  type T = Static<typeof T>

  Expect(T).ToBe<T>() // ? how to test....
}
