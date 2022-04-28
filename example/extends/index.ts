import * as Types from '@sidewinder/type'
import { Type, Static, Extends } from '@sidewinder/type'



type T = any extends any ? 1 : 2

const T = Type.Extends(
    Type.Any(),
    Type.Any(),
    Type.Literal(1),
    Type.Literal(2)
)

console.log(T)


