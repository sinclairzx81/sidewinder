import { Type, Host, WebSocketService } from '@sidewinder/server'
import { WebSocketClient } from '@sidewinder/client'
import { Contract } from '../shared/index'
import cors from 'cors'

const service = new WebSocketService(Contract, Type.Object({
    clientId: Type.String(),
    name:     Type.String(),
    roles:    Type.Array(Type.String())
}))

service.event('authorize', (clientId, request) => ({ clientId, name: 'dave', roles: ['admin'] }))
service.event('connect',   (context) => console.log('server:connect', context))
service.event('close',     (context) => console.log('server:close',   context))

service.method('add',    (context, a, b) => a + b)
service.method('sub',    (context, a, b) => a - b)
service.method('mul',    (context, a, b) => a * b)
service.method('div',    (context, a, b) => a / b)

const host = new Host()
host.use(cors())
host.use('/math', service)
host.listen(5001).then(() => console.log('service running on port 5001'))

async function clientTest() {
    const client = new WebSocketClient(Contract, 'ws://localhost:5001/math')
    const result = await client.call('add', 1, 2)
    await client.call('add', 1, 2)
    await client.call('add', 1, 2)
    await client.call('add', 1, 2)
    client.close()
    console.log('client-result:', result)
}
clientTest().catch(error => console.log(error))