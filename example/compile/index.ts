import { Type } from '@sidewinder/contract'
import { WebClient } from '@sidewinder/client'
import { WebService, Host } from '@sidewinder/server'

const Contract = Type.Contract({
    format: 'msgpack',
    server: {
        test: Type.Function([Type.Number()], Type.Number())
    }
})

const service = new WebService(Contract)

service.event('authorize', () => {
    return 'hello'
})

service.method('test', (context, data) => {
    return 1
})

const host = new Host()
host.use('/', service)
host.listen(5000)


const client = new WebClient(Contract, 'http://localhost:5000')

client.call('test', 1).then(result => {
    
})

