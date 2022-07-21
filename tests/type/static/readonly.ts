import { Expect } from './assert'
import { Type, Static } from '@sidewinder/type'

{
  const T = Type.Object({
    A: Type.Readonly(Type.String()),
  })

  type T = Static<typeof T>

  Expect(T).ToBe<{
    readonly A: string
  }>()
}
