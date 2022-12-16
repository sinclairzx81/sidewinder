import { Type } from '@sidewinder/contract'
import { Host } from '@sidewinder/host'
import { RpcService } from '@sidewinder/service'
import { RpcClient } from '@sidewinder/client'

export const Contract = Type.Contract({
  format: 'msgpack',
  server: {
    add: Type.Function([Type.Number(), Type.Number()], Type.Number()),
  },
})

const service = new RpcService(Contract)
service.method('add', (context, a, b) => a + b)

const host = new Host({})
host.use('/math', service)
host.listen(5000)

async function test() {
  const client = new RpcClient(Contract, 'http://localhost:5000/math')
  for (let i = 0; i < 10000; i++) {
    await client.call('add', i, 2).then(console.log)
  }
}
test()
