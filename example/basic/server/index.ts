import { Host, WebService } from '@sidewinder/server'
import { WebClient } from '@sidewinder/client'
import { Contract } from '../shared/index'
import { Type } from '@sidewinder/type'
import cors from 'cors'


const Context = Type.Object({
    clientId: Type.String(),
    name:     Type.String(),
    roles:    Type.Array(Type.String())
})

const service = new WebService(Contract, Context)
service.event('authorize', (clientId, request) => ({ clientId, name: 'dave', roles: ['admin'] }))
service.event('connect',   (context) => console.log('server:connect', context))
service.event('close',     (context) => console.log('server:close',   context))

function allow(roles: string[]) {
    return (context: typeof Context['$static']) => {
        throw Error('not authorized')
        return { asdasd: 1, ...context }
    }
}

service.method('add', (context) => 1 as const, (context, a, b) => {
    return 1
})
service.method('add', allow(['admin', 'moderator']), (context, a, b) => {
   return a + b
})

service.method('sub', (context, a, b) => a - b)
service.method('mul', (context) => 3, (context, a, b) => a * b)
service.method('div', (context, a, b) => a / b)

const host = new Host()
host.use(cors())
host.use('/math', service)
host.listen(5001).then(() => console.log('service running on port 5001'))

async function clientTest() {
    const client = new WebClient(Contract, 'http://localhost:5001/math')
    const result = await client.call('add', 1, 2)
    await client.call('add', 1, 2)
    await client.call('sub', 1, 2)
    await client.call('sub', 1, 2)
}
clientTest().catch(error => console.log(error))