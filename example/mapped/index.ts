import { Type, Static } from '@sidewinder/type'

const T = Type.Object({
    x: Type.ReadonlyOptional(Type.Number()),
    y: Type.Readonly(Type.Number()),
    z: Type.Optional(Type.Number()),
    w: Type.Number(),
})

const M = Type.Mapped(T, Type.String())

console.log(M)

type M = Static<typeof M>
