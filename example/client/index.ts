import { WebSocketClient, WebProxy } from '@sidewinder/client'
import { Contract }         from '../shared/index'

const client = WebProxy(new WebSocketClient(Contract, 'ws://localhost:5001/math'))
const result = await client.add(1, 2)
const buffer = await client.buf(new Uint8Array(10))

console.log('result', result)
console.log('buffer', buffer)


 
