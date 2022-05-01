import * as Types from '@sidewinder/type'
import { Type, Static, Extends, ExtendsResult } from '@sidewinder/type'
import { Value } from '@sidewinder/value'

enum EA {
    A, B
}
enum EB {
    A, C
}

const A = Type.Enum(EA)
const B = Type.Enum(EB)
console.log(A)
console.log(B)
const R = Extends.Check(A, B)

console.log(R)




