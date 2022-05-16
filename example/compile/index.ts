import { Type, TypeCompiler } from '@sidewinder/type'

const T = Type.Tuple([
    Type.Rec((Node) =>
        Type.Object({
            id: Type.String(),
            nodes: Type.Array(Node),
        }),
    ),
])

const C = TypeCompiler.Compile(T)
const R = C([
    {
        id: 'A',
        nodes: [
            { id: 1, nodes: [] },
            { id: 'C', nodes: [] },
        ],
    },
])
console.log(R)
// console.log(T)

console.log(TypeCompiler.Kernel(T))


// function check_type_0(value: any) {
//     console.log(5, value)
//     // if (!(typeof value[0] === 'object' && value[0] !== null && !Array.isArray(value[0]))) { return { ok: false, path: 'value[0]', data: value[0] } }
//     if (!(typeof value === 'object' && value[0] !== null && !Array.isArray(value[0]))) { return { ok: false, path: 'value[0]', data: value[0] } }
//     console.log(4)
//     if (!(typeof value[0].id === 'string')) { return { ok: false, path: 'value[0].id', data: value[0].id } }
//     if (!(Array.isArray(value[0].nodes) && value[0].nodes.every((value: any) => (check_type_0(value).ok)))) { return { ok: false, path: 'value[0].nodes', data: value[0].nodes } }
//     return { ok: true }
// }

// function check(value: any) {
//     if (!(Array.isArray(value))) { return { ok: false, path: 'value', data: value } }
//     console.log(1)
//     if (!(value.length === 1)) { return { ok: false, path: 'value', data: value } }
//     console.log(2)
//     if (!((check_type_0(value[0]).ok))) { return { ok: false, path: 'value', data: value } }
//     console.log(3)
//     return { ok: true }
// }
// console.log(check([
//     {
//         id: 'A',
//         nodes: [
//             { id: 'B', nodes: [] },
//             { id: 'C', nodes: [] },
//         ],
//     },
// ]))