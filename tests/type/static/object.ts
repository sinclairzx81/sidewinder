import { Expect } from './assert'
import { Type } from '@sidewinder/type'

{
  const T = Type.Object({
    A: Type.String(),
    B: Type.String(),
    C: Type.String(),
  })

  Expect(T).ToBe<{
    A: string
    B: string
    C: string
  }>()
}
{
  const T = Type.Object({
    A: Type.Object({
      A: Type.String(),
      B: Type.String(),
      C: Type.String(),
    }),
    B: Type.Object({
      A: Type.String(),
      B: Type.String(),
      C: Type.String(),
    }),
    C: Type.Object({
      A: Type.String(),
      B: Type.String(),
      C: Type.String(),
    }),
  })
  Expect(T).ToBe<{
    A: {
      A: string
      B: string
      C: string
    }
    B: {
      A: string
      B: string
      C: string
    }
    C: {
      A: string
      B: string
      C: string
    }
  }>()
}
