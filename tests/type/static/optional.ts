import { Expect } from './assert'
import { Type, Static } from '@sidewinder/type'

{
  const T = Type.Object({
    A: Type.Optional(Type.String()),
  })

  type T = Static<typeof T>

  Expect(T).ToBe<{
    A?: string
  }>()
}
