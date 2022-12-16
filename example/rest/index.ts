import { RestService } from '@sidewinder/service'
import { Host } from '@sidewinder/host'
import { Fetch } from '@sidewinder/fetch'

export class Service extends RestService {
  private _error = super.event('error', (clientId, error) => {
    console.log(clientId, error)
  })

  private index = super.get('/', async (req, res) => {
    res.html('<h1>hello world</h1>')
  })

  private _put = super.put('/', async (req, res) => {
    console.log(req.clientId)
    res.text('put response')
  })

  private _post = super.post('/', async (req, res) => {
    console.log(req.clientId)
    res.text('post response')
  })

  private _delete = super.delete('/', async (req, res) => {
    console.log(req.clientId)
    res.text('delete response')
  })

  private _patch = super.patch('/', async (req, res) => {
    console.log(req.clientId)
    res.text('patch response')
  })
}

const service = new Service()
const host = new Host()
host.use('/rest', service)
host.use((req, res) => res.send('hello'))
host.listen(5000)

// ------------------------------------------------------------------
// Client Test
// ------------------------------------------------------------------

async function test(method: string, endpoint: string) {
  const headers = { x: '0', y: '1', z: '2' }
  await fetch(endpoint, {
    method: method,
    headers,
    body: method === 'get' ? undefined : JSON.stringify({ a: 10, b: 20, c: 30 }),
  })
    .then(async (res) => {
      console.log('client:', res.status)
      console.log('client:', res.headers)
      console.log('client:', await res.text())
    })
    .catch(() => console.log('error'))
}

for (let i = 0; i < 1; i++) {
  test('get', 'http://localhost:5000/rest')
  test('post', 'http://localhost:5000/rest')
  test('patch', 'http://localhost:5000/rest')
  test('delete', 'http://localhost:5000/rest')
  test('put', 'http://localhost:5000/rest')
}
