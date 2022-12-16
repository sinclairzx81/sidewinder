import { Type } from '@sidewinder/contract'
import { Host, WebSocketService } from '@sidewinder/server'
import { WebSocketClient } from '@sidewinder/client'

// ---------------------------------------------------------------------
// Contract
// ---------------------------------------------------------------------

export const MathContract = Type.Contract({
  format: 'msgpack',
  server: {
    add: Type.Function([Type.Number(), Type.Number()], Type.Number()),
    sub: Type.Function([Type.Number(), Type.Number()], Type.Number()),
    mul: Type.Function([Type.Number(), Type.Number()], Type.Number()),
    div: Type.Function([Type.Number(), Type.Number()], Type.Number()),
  }
})

// ---------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------

export class MathService extends WebSocketService<typeof MathContract> {
    constructor() {
        super(MathContract)
    }
    public onAdd = this.method('add', (context, a, b) => {
        return a + b
    })
    public onSub = this.method('sub', (context, a, b) => {
        return a - b
    })
    public onMul = this.method('mul', (context, a, b) => {
        return a + b
    })
    public onDiv = this.method('div', (context, a, b) => {
        return a / b
    })
}

const host = new Host()
host.use('/math', new MathService())
host.listen(5000)

// ---------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------

async function client() {
    const client = new WebSocketClient(MathContract, 'ws://localhost:5000/math')
    console.log('add', await client.call('add', 1, 2))
    console.log('sub', await client.call('sub', 1, 2))
    console.log('mul', await client.call('mul', 1, 2))
    console.log('div', await client.call('div', 1, 2))
}
client()
