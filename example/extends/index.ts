import * as Types from '@sidewinder/type'
import { Type, Static, Extends } from '@sidewinder/type'

const A = Type.Extract(
    Type.Union([Type.String()]), 
    Type.Union([Type.String()])
)

const X = Type.Exclude(Type.Union([
    Type.Literal('a'),
    Type.Literal('b'),
    Type.Literal('c')
]), Type.Union([
    Type.Literal('a')
]), { $id: 'a'})

type A = Static<typeof X>

type X = Extract<{a: number}, { b: string }>

console.log(X)
