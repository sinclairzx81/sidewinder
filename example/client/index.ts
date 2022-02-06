import { WebSocketClient  } from '@sidewinder/client'
import { Contract }         from '../shared/index'

const client  = new WebSocketClient(Contract, 'ws://localhost:5001/math')
const result = await client.call('add', 1, 2)
const buffer = await client.call('buf', new Uint8Array(10))

for(let i = 0; i < 1000; i++) {
    const query  = await client.call('query', { name: { $eq: 'dave' } })
    console.log('query', query)
}

console.log('result', result)
console.log('buffer', buffer)


 
