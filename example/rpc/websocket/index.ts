import { Type } from '@sidewinder/contract'
import { Host } from '@sidewinder/host'
import { RpcSocketService } from '@sidewinder/service'
import { RpcSocketClient } from '@sidewinder/client'

export const Contract = Type.Contract({
  server: {
    add: Type.Function([Type.Number(), Type.Number()], Type.Number()),
  },
})

const service = new RpcSocketService(Contract)
service.event('authorize', (context, request) => {
  console.log(request, request.headers)
  return context
})
service.method('add', (context, a, b) => a + b)

const host = new Host({})
host.use('/math', service)
host.listen(5000)

async function test() {
  const client = new RpcSocketClient(Contract, 'ws://localhost:5000/math')
  for (let i = 0; i < 10000; i++) {
    await client.call('add', i, 2).then(console.log)
  }
}
test()
