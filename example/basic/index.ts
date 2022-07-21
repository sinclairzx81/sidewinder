import { Type, Host, WebSocketService } from '@sidewinder/server'
import { WebSocketClient } from '@sidewinder/client'

// --------------------------------------------------------------
// Contract
// --------------------------------------------------------------

export const Contract = Type.Contract({
    server: {
        echo: Type.Function([Type.String()], Type.String())
    }
})

// --------------------------------------------------------------
// Service
// --------------------------------------------------------------

export class EchoService extends WebSocketService<typeof Contract> {

    constructor() {
        super(Contract)
    }   

    public echo = super.method('echo', (context, input) => {

        return input
    })
}

// --------------------------------------------------------------
// Host
// --------------------------------------------------------------

const host = new Host()

host.use('/api', new EchoService())

host.listen(5000)

// --------------------------------------------------------------
// Client
// --------------------------------------------------------------

const client = new WebSocketClient(Contract, 'ws://localhost:5000/api')

client.call('echo', `hello world`).then(result => console.log(result))
