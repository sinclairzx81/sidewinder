import { Type } from '@sidewinder/type'

const T = Type.Object({
    a: Type.String(),
    b: Type.String(),
    c: Type.String()
})

const K = Type.KeyOf(T)

console.log(K)