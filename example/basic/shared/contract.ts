import { Type } from '@sidewinder/contract'

export const MathServiceContract = Type.Contract({
  format: 'msgpack',
  server: {
    add: Type.Function([Type.Number(), Type.Number()], Type.Number()),
    sub: Type.Function([Type.Number(), Type.Number()], Type.Number()),
    mul: Type.Function([Type.Number(), Type.Number()], Type.Number()),
    div: Type.Function([Type.Number(), Type.Number()], Type.Number()),
  },
  client: {
    echo: Type.Function([Type.String()], Type.String()),
  },
})
