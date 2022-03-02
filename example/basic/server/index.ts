import { Type, Host, WebSocketService } from '@sidewinder/server'
import { WebSocketClient } from '@sidewinder/client'
import { Contract } from '../shared/index'
import cors from 'cors'

const service = new WebSocketService(Contract, Type.Object({
    clientId: Type.String(),
    name:     Type.String(),
    roles:    Type.Array(Type.String())
}))
service.event('authorize', (clientId, request) => {
    return { clientId, name: 'dave', roles: [] }
})
service.event('connect', (context) => console.log('server:connect', context))
service.event('close',   (context) => console.log('server:close',   context))
service.method('add',    (context, a, b) => a + b)
service.method('sub',    (context, a, b) => a - b)
service.method('mul',    (context, a, b) => a * b)
service.method('div',    (context, a, b) => a / b)

const host = new Host()
host.use(cors())
host.use('/math', service)
host.listen(5001).then(() => console.log('service running on port 5001'))

async function clientTest() {
    const client = new WebSocketClient(Contract, 'ws://localhost:5001/math?token=123')
    const result0 = await client.call('add', 1, 2)
    const result1 = await client.call('sub', 1, 2)
    const result2 = await client.call('mul', 1, 2)
    const result3 = await client.call('div', 1, 2)
    client.close()
    console.log('client-results:', result0, result1, result2, result3)
}
clientTest().catch(error => console.log(error))