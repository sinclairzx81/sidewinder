import { Type, Static } from '@sidewinder/type'

const T = Type.Object({
    x: Type.Number(),
    y: Type.Number(),
    z: Type.Number()
})

const M = Type.Mapped(Type.Omit(T, ['z']), Type.Boolean())

type M = Static<typeof M>
