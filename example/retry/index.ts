import { WebSocketClient, Type } from "@sidewinder/client"
import { WebSocketService, Host } from "@sidewinder/server"

const Contract = Type.Contract({
    format: 'json',
    server: {
        add: Type.Function([Type.Number()], Type.Number())
    }
})

async function client() {
    const client = new WebSocketClient(Contract, 'ws://localhost:5000/math', {
        autoReconnectBuffer: false,
        autoReconnectEnabled: true,
        autoReconnectTimeout: 4000,
    })
    setInterval(async () => {
        const result = await client.call('add', 1).catch(error => console.log(error))
        console.log(result)
    }, 10)
}

async function server() {
    const host = new Host()
    const service = new WebSocketService(Contract)
    let count = 0
    service.method('add', async (context, request) => {
        console.log('server iteration', count)
        count += 1
        // dispose and restart
        if(count > 32) {
            host.dispose()
            setTimeout(() => server(), 400)
            return 1
        }
        return request + 1
    })
    host.use('/math', service)
    await host.listen(5000)
    return host
}

async function start() {
    server()
    client()
}
start()

