import { WebSocketClient } from '@sidewinder/client'
import { Contract }  from '../shared/index'

async function clientTest() {
    const client = new WebSocketClient(Contract, 'ws://localhost:5001/math')
    const result = await client.call('add', 1, 2)
    console.log('result:', result)
}
clientTest()
