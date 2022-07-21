import { Expect } from './assert'
import { Type, Static } from '@sidewinder/type'

{
  const T = Type.Tuple([Type.Number(), Type.String(), Type.Boolean()])

  type T = Static<typeof T>

  Expect(T).ToBe<[number, string, boolean]>()
}
