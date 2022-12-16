import { RpcClient } from '@sidewinder/client'
import { MathServiceContract } from '../shared/index'

async function clientTest() {
  const client = new RpcClient(MathServiceContract, 'http://localhost:5001/math')
  const result = await client.call('add', 1, 2)
  console.log('result:', result)
}
clientTest()
