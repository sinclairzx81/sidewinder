import { Value } from '@sidewinder/value'
import { Type, Static } from '@sidewinder/type'

const Node = Type.Rec(Self => Type.Object({
    id: Type.String(),
    nodes: Type.Array(Self)
}))

// console.log(JSON.stringify(Node, null, 2))
 
const V = Value.Create(Node)
V.nodes.push({ id: '', nodes: [{ id: 'a', nodes: []}]})

console.log(Value.Check(Node, V))
console.log(V)

