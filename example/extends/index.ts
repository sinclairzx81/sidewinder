import * as Types from '@sidewinder/type'
import { Type, Static, Extends, ExtendsResult } from '@sidewinder/type'
import { Value } from '@sidewinder/value'


type A = boolean | boolean
type B = boolean
type T = A extends B ? 1 : 2

const A = Type.Union([Type.Boolean(), Type.Boolean()])
const B = Type.Boolean()



const X = Extends.Check(A, B)

console.log(ExtendsResult[X])

