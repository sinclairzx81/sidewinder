import { Expect } from './assert'
import { Type, Static } from '@sidewinder/type'

{
  const T = Type.Strict(
    Type.Object({
      A: Type.String(),
      B: Type.String(),
      C: Type.String(),
    }),
  )

  type T = Static<typeof T>

  Expect(T).ToBe<{
    A: string
    B: string
    C: string
  }>()
}
