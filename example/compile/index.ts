import { Type, TypeCompiler } from '@sidewinder/type'

const T = Type.Object({
    x: Type.Number(),
    y: Type.Number(),
    z: Type.Number(),
    a: Type.Array(Type.Number())
})

console.log(TypeCompiler.Kernel(T))

const Func = TypeCompiler.Compile(T)

const Result = Func({x: 1, y: 1, z: 1, a: 1 })


console.log(Result)
