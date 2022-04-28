import * as Types from '@sidewinder/type'
import { Type, TypeExtends } from '@sidewinder/type'

const A = Type.String()

const B = Type.String()

const R = Type.Extends(A, B, Type.Literal('true'), Type.Literal('false'))

console.log(R)