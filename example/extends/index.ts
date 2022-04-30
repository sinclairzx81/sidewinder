import * as Types from '@sidewinder/type'
import { Type, Static, Extends, ExtendsResult } from '@sidewinder/type'
import { Value } from '@sidewinder/value'


// if all properties in Right are in Left, then true
type T = {  } extends object ? 1 : 2

const A = Type.Object({ a: Type.Number() })//Type.Object({ a: Type.Number(), b: Type.Number() })
const B = Type.Object({ })

const X = Extends.Check(A, B) 

console.log(ExtendsResult[X])

