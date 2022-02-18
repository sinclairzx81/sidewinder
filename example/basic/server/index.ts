import { Host, WebService } from '@sidewinder/server'
import { WebClient } from '@sidewinder/client'
import { Contract } from '../shared/index'
import { Type } from '@sidewinder/type'
import cors from 'cors'

const service = new WebService(Contract, Type.Object({
    clientId: Type.String(),
    name:     Type.String(),
    roles:    Type.Array(Type.String())
}))

service.event('authorize', (clientId, request) => {
    return { clientId, roles: [], name: '' }
})

service.event('connect', (context) => console.log('connect', context))
service.event('close',   (context) => console.log('close', context))
service.method('add',    (context, a, b) => {
    console.log('add', context.name)
    return 1
})
service.method('sub',    (context, a, b) => a - b)
service.method('mul',    (context, a, b) => a * b)
service.method('div',    (context, a, b) => a / b)




const host = new Host()
host.use(cors())
host.use('/math', service)

host.listen(5001).then(() => console.log('service running on port 5001'))
async function clientTest() {
    const client = new WebClient(Contract, 'http://localhost:5001/math')
    const result = await client.send('add', 1, 2)
    console.log('RESULT', result)
}
clientTest().catch(error => console.log(error))