import { Expect } from './assert'
import { Type, Static } from '@sidewinder/type'

{
  const T = Type.ReturnType(Type.Function([], Type.String()))

  type T = Static<typeof T>

  Expect(T).ToBe<string>()
}

{
  const T = Type.ReturnType(Type.Function([Type.Number()], Type.Number()))

  type T = Static<typeof T>

  Expect(T).ToBe<number>()
}
