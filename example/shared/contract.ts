import { Type } from '@sidewinder/contract'

export const Contract = Type.Contract({
    server: {
        add: Type.Function([Type.Number(), Type.Number()], Type.Number()),
        sub: Type.Function([Type.Number(), Type.Number()], Type.Number()),
        mul: Type.Function([Type.Number(), Type.Number()], Type.Number()),
        div: Type.Function([Type.Number(), Type.Number()], Type.Number()),
    },
    client: {
        print: Type.Function([Type.String()], Type.Any())
    },
})
