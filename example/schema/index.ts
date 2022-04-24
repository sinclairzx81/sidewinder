import { Type, Static } from '@sidewinder/type'

const T = Type.Tuple([Type.Number()])

const Node = Type.Rec(Self => Type.Object({
    id: Type.String(),
    nodes: Type.Array(Type.Number())
}))

// const Node = Type.String()

type Node = Static<typeof Node>




console.log(JSON.stringify(T, null, 2))