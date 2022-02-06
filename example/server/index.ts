import { Host, WebSocketService } from '@sidewinder/server'
import { WebSocketClient } from '@sidewinder/client'
import { Contract } from '../shared/index'
import cors from 'cors'

const service = new WebSocketService(Contract)
service.method('buf',   (clientId, buf) => buf)
service.method('add',   (clientId, a, b) => a + b)
service.method('sub',   (clientId, a, b) => a - b)
service.method('mul',   (clientId, a, b) => a * b)
service.method('div',   (clientId, a, b) => a / b)

const host = new Host()
host.use(cors())
host.use('/math', service)
host.listen(5001).then(() => console.log('service running on port 5001'))

async function clientTest() {
    const client = new WebSocketClient(Contract, 'ws://localhost:5001/math')
    const result = await client.call('add', 1, 2)
    const buffer = await client.call('buf', new Uint8Array(10))
    console.log(result)
    console.log(buffer)
}
clientTest()
