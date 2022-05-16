import { Type, TypeCompiler } from '@sidewinder/type'

const T = Type.Object({
    x: Type.Number(),
    y: Type.Number(),
    z: Type.Number(),
}, { $id: 'f2fdfad3-1006-4e62-bcb1-d5f1ceb90a0f' })

const R = Type.Ref(T)

console.log(TypeCompiler.Kernel(R, [T]))

const Func = TypeCompiler.Compile(R, [T])

const Result = Func({x: 1, y: 1, z: 1 })


console.log(Result)
