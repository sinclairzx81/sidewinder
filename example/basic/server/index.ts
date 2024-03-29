import { Type, Host, WebService } from '@sidewinder/server'
import { WebClient } from '@sidewinder/client'
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

export class MathService extends WebService<typeof MathServiceContract, typeof MathServiceContext> {
  constructor() {
    super(MathServiceContract, MathServiceContext)
  }

  // -----------------------------------------------------------------
  // Events
  // -----------------------------------------------------------------

  on_authorize = this.event('authorize', (clientId, request) => {
    console.log('server:authorize', clientId, request.query)
    return { clientId, name: 'dave', roles: [] }
  })

  on_connect = this.event('connect', (context) => {
    console.log('server:connect', context)
  })

  on_close = this.event('close', (context) => {
    console.log('server:close', context)
  })

  // -----------------------------------------------------------------
  // Methods
  // -----------------------------------------------------------------
  add = this.method('add', (context, a, b) => a + b)
  sub = this.method('sub', (context, a, b) => a - b)
  mul = this.method('mul', (context, a, b) => a * b)
  div = this.method('div', (context, a, b) => a / b)
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
  const client = new WebClient(MathServiceContract, 'http://localhost:5001/math?token=<signed-token>')
  const add = await client.call('add', 1, 2)
  const sub = await client.call('sub', 1, 2)
  const mul = await client.call('mul', 1, 2)
  const div = await client.call('div', 1, 2)
  console.log('client:', add, sub, mul, div)
}
clientTest().catch((error) => console.log(error))
