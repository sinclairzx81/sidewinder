import * as Types from '@sidewinder/type'
import { Type, Static, Extends, ExtendsResult } from '@sidewinder/type'
import { Value } from '@sidewinder/value'


type X = { a: number }
type Y = { a: number }
type Z = Extract<X, Y>

// if all properties in Right are in Left, then true
type T = {  } extends object ? 1 : 2

const A = Type.Object({ a: Type.Number() }) // Type.Object({ a: Type.Number(), b: Type.Number() })
const B = Type.Object({ a: Type.Number() })
const C = Type.Extends(A, B, Type.Literal(1), Type.Literal(2))
const D = Type.Extract(A, Type.Union([B]))

function assert(value: Static<typeof D>) {
    console.log(value)
}

const X = Extends.Check(A, B) 

console.log(ExtendsResult[X])

