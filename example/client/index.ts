import { WebSocketClient  } from '@sidewinder/client'
import { Contract }         from '../shared/index'

const client  = new WebSocketClient(Contract, 'ws://localhost:5001/math')
const result = await client.call('add', 1, 2)
const buffer = await client.call('buf', new Uint8Array(10))

console.log('result', result)
console.log('buffer', buffer)


 
