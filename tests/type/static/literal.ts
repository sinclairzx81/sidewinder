import { Expect } from './assert'
import { Type } from '@sidewinder/type'

Expect(Type.Literal('hello')).ToBe<'hello'>()

Expect(Type.Literal(true)).ToBe<true>()

Expect(Type.Literal(42)).ToBe<42>()
