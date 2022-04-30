import * as Types from '@sidewinder/type'
import { Type, Static, Extends, ExtendsResult } from '@sidewinder/type'
import { Value } from '@sidewinder/value'

// Key: String:  '^.*$'
// Key: Number:  '^(0|[1-9][0-9]*)$'
// Key: Literal: '^A|B|C$'


type A = Record<number, number> extends Record<number, number> ? 1 : 2

const A = Type.Record(Type.Number(), Type.Number())

const B = Type.Record(Type.Number(), Type.Number())

const result = Extends.Check(A, B)

console.log(ExtendsResult[result])




