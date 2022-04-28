import * as Types from '@sidewinder/type'
import { Type, Static, Extends, ExtendsResult } from '@sidewinder/type'





type T = any extends unknown | string ? 1 : 2

const A = Type.Any()

const B = Type.Union([Type.Unknown(), Type.String()])

const R = Extends.Check(A, B)

console.log(ExtendsResult[R])


