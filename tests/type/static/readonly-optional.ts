import { Expect } from './assert'
import { Type, Static } from '@sidewinder/type'

{
  const T = Type.Object({
    A: Type.ReadonlyOptional(Type.String()),
  })
  Expect(T).ToBe<{
    readonly A?: string
  }>()
}
