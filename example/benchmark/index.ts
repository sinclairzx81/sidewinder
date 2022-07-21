import { Type, Host, WebSocketService } from '@sidewinder/server'
import { WebSocketClient } from '@sidewinder/client'

export const Contract = Type.Contract({
    server: {
        echo: Type.Function([Type.String()], Type.String())
    }
})

export class EchoService extends WebSocketService<typeof Contract> {

    constructor() {
        super(Contract)
    }   

    public echo = super.method('echo', (context, input) => {

        return input
    })
}

const host = new Host()

host.use('/api', new EchoService())

host.listen(5000)


async function benchmark() {

    const client = new WebSocketClient(Contract, 'ws://localhost:5000/api')

    while(true) {

        const requests = Array.from({ length: 40_000 }).map((_, i) => client.call('echo', `${i} hello world`))

        const start = Date.now()

        const results = await Promise.all(requests)

        console.log(results.length, Date.now() - start, 'ms') // average 1100ms
    }
}

benchmark()