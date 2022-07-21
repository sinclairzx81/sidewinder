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

export const Context = Type.Object({

    clientId: Type.String(),

    roles: Type.Array(Type.String())
})

// --------------------------------------------------------------
// Service
// --------------------------------------------------------------

export class EchoService extends WebSocketService<typeof Contract, typeof Context> {

    constructor() {
        super(Contract, Context)
    }

    public authorize = super.event('authorize', (context, request) => {
        
        return { clientId: context, roles: [] }
    })

    public error = super.event('error', (context, error) => {

        console.log(error)
    })

    public echo = super.method('echo', (context, input) => input)
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

client.call('echo', `hello world`).then(result => console.log(result)).catch(error => { })
