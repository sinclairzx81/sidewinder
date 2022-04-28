import * as Types from '@sidewinder/type'
import { Type, Static, Extends } from '@sidewinder/type'



type T = any extends unknown ? 1 : 2

const T = Type.Extends(
    Type.Any(),
    Type.Unknown(),
    Type.Literal(1),
    Type.Literal(2)
)

console.log(T)


