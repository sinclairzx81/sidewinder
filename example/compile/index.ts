import { Type, TypeCompiler } from '@sidewinder/type'

const T = Type.Object({
    node: Type.Rec(Node => Type.Object({
        id: Type.String(),
        item: Type.Object({
            nodes: Type.Array(Node)
        })
    }))
})

const I = {
    node: {
        id: 'nodeA',
        item: {
            nodes: [{
                id: 'nodeA',
                item: {
                    nodes: []
                }
            }]
        }
    }
} 

console.log(TypeCompiler.Kernel(T))
const Check = TypeCompiler.Compile(T)
const Result = Check(I)
console.log(JSON.stringify(Result, null, 2))
