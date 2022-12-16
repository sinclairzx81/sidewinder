import { Type, RpcService } from '@sidewinder/service'
import { Host } from '@sidewinder/host'
import { RpcClient } from '@sidewinder/client'
import { MathServiceContract } from '../shared/index'
import cors from 'cors'

// -----------------------------------------------------------------
// Service
// -----------------------------------------------------------------

export const MathServiceContext = Type.Object({
  clientId: Type.String(),
  name: Type.String(),
  roles: Type.Array(Type.String()),
})

export class MathService extends RpcService<typeof MathServiceContract, typeof MathServiceContext> {
  constructor() {
    super(MathServiceContract, MathServiceContext)
  }

  // -----------------------------------------------------------------
  // Events
  // -----------------------------------------------------------------

  onAuthorize = this.event('authorize', (clientId, request) => {
    console.log('server:authorize', clientId, request.query)
    return { clientId, name: 'dave', roles: [] }
  })

  onConnect = this.event('connect', (context) => {
    console.log('server:connect', context)
  })

  onClose = this.event('close', (context) => {
    console.log('server:close', context)
  })

  // -----------------------------------------------------------------
  // Methods
  // -----------------------------------------------------------------
  onAdd = this.method('add', (context, a, b) => a + b)
  onSub = this.method('sub', (context, a, b) => a - b)
  onMul = this.method('mul', (context, a, b) => a * b)
  onDiv = this.method('div', (context, a, b) => a / b)
}

// -----------------------------------------------------------------
// Host
// -----------------------------------------------------------------

const host = new Host()
host.use(cors())
host.use('/math', new MathService())
host.listen(5001)

// -----------------------------------------------------------------
// Client Test
// -----------------------------------------------------------------

async function clientTest() {
  const client = new RpcClient(MathServiceContract, 'http://localhost:5001/math?token=<signed-token>')
  const add = await client.call('add', 1, 2)
  const sub = await client.call('sub', 1, 2)
  const mul = await client.call('mul', 1, 2)
  const div = await client.call('div', 1, 2)
  console.log('client:', add, sub, mul, div)
}
clientTest().catch((error) => console.log(error))
