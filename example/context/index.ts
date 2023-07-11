import { RestService, Host } from '@sidewinder/server'

export class ActionService extends RestService {
  public onAction = this.post('/echo', async (req, res) => {
    console.log('claims', req.context.get('claims'))
    const buffer = await req.arrayBuffer()
    await res.arrayBuffer(buffer)
  })
  public onAuthorize = this.event('authorize', (context, request) => {
    request.context.set('claims', { a: 1, b: 2 })
  })
}

const host = new Host()
host.use('/action', new ActionService())
host.listen(5000)

async function start() {
  const method = 'post'
  const headers = { authorization: 'Bearer 12345' }
  const body = new Uint8Array(1000)
  const result = await fetch('http://localhost:5000/action/echo', { method, headers, body })
    .then((res) => res.text())
    .catch(console.log)
  console.log(result)
}

start()
