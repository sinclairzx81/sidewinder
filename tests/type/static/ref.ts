import { Expect } from './assert'
import { Type, Static } from '@sidewinder/type'

{
  const T = Type.String({ $id: 'T' })
  const R = Type.Ref(T)

  type T = Static<typeof T>
  type R = Static<typeof R>

  Expect(T).ToBe<string>()
  Expect(R).ToBe<string>()
}
