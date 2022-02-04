import { Host, WebService } from '@sidewinder/server'
import { Contract }         from '../shared/index'
import cors                 from 'cors'

const service = new WebService(Contract)
service.method('add', (clientId, a, b) => a + b)
service.method('sub', (clientId, a, b) => a - b)
service.method('mul', (clientId, a, b) => a * b)
service.method('div', (clientId, a, b) => a / b)

const host = new Host()
host.use(cors())
host.use('/math', service) 
host.listen(5001).then(() => console.log('service running on port 5001'))
