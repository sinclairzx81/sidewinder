import { WebClient, WebProxy } from '@sidewinder/client'
import { Contract }         from '../shared/index'

async function test() {
    const client = new WebClient(Contract, 'http://localhost:5001/math')
    const result = await client.call('add', 1, undefined)
    console.log('result', result)
}
test()
