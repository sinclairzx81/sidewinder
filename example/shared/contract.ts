import { Type } from '@sidewinder/contract'

export const Contract = Type.Contract({
    format: 'msgpack', 
    server: {
        buf: Type.Function([Type.Uint8Array()], Type.Uint8Array()),
        add: Type.Function([Type.Number(), Type.Number()], Type.Number()),
        sub: Type.Function([Type.Number(), Type.Number()], Type.Number()),
        mul: Type.Function([Type.Number(), Type.Number()], Type.Number()),
        div: Type.Function([Type.Number(), Type.Number()], Type.Number()),
    }
})
