import { Type, Exception } from '@sidewinder/contract'
import { Host, WebSocketService } from '@sidewinder/server'
import { WebSocketClient, WebSocketClientOptions } from '@sidewinder/client'
import { Assert } from '../../assert/index'

export type ContextCallback = (host: Host, service: WebSocketService<typeof Contract>, client: WebSocketClient<typeof Contract>, port: number) => Promise<void>

const Contract = Type.Contract({
  format: 'msgpack',
  server: {
    'errors:error': Type.Function([], Type.Any()),
    'errors:exception': Type.Function([], Type.Any()),
    'send:store': Type.Function([Type.String()], Type.Any()),
    'send:fetch': Type.Function([], Type.String()),
    'void:in': Type.Function([Type.Void()], Type.Boolean()),
    'void:out': Type.Function([Type.Number()], Type.Void()),
    'void:inout': Type.Function([Type.Void()], Type.Void()),
    'duplex:echo': Type.Function([Type.String()], Type.String()),
    'duplex:stream': Type.Function([Type.Number()], Type.Void()),
    'basic:add': Type.Function([Type.Number(), Type.Number()], Type.Number()),
    'basic:sub': Type.Function([Type.Number(), Type.Number()], Type.Number()),
    'basic:mul': Type.Function([Type.Number(), Type.Number()], Type.Number()),
    'basic:div': Type.Function([Type.Number(), Type.Number()], Type.Number()),
  },
  client: {
    'duplex:echo': Type.Function([Type.String()], Type.String()),
    'duplex:stream': Type.Function([], Type.Void()),
    'void:inout': Type.Function([Type.Void()], Type.Void()),
  },
})

function context(callback: ContextCallback, options?: WebSocketClientOptions) {
  return async () => {
    const port = Assert.nextPort()
    let store: string = ''

    const service = new WebSocketService(Contract)
    service.method('send:store', (clientId, data) => {
      store = data
    })
    service.method('send:fetch', (clientId) => store)
    service.method('errors:error', (clientId) => {
      throw Error('boom')
    })
    service.method('errors:exception', (clientId) => {
      throw new Exception('boom', 3000, {})
    })
    service.method('void:in', (clientId, data) => data === null)
    service.method('void:out', (clientId, data) => {})
    service.method('void:inout', async (clientId, data) => await service.call(clientId, 'void:inout', data))
    service.method('duplex:echo', async (clientId, data) => await service.call(clientId, 'duplex:echo', data))
    service.method('duplex:stream', async (clientId, count) => {
      for (let i = 0; i < count; i++) await service.call(clientId, 'duplex:stream')
    })
    service.method('basic:add', (clientId, a, b) => a + b)
    service.method('basic:sub', (clientId, a, b) => a - b)
    service.method('basic:mul', (clientId, a, b) => a * b)
    service.method('basic:div', (clientId, a, b) => a / b)

    const host = new Host()
    host.use(service)
    await host.listen(port)

    const client = new WebSocketClient(Contract, `ws://localhost:${port}`, options)
    await callback(host, service, client, port)
    client.close()
    await host.dispose()
  }
}

describe('client/WebSocketClient:Json', () => {
  // ------------------------------------------------------------------
  // Call()
  // ------------------------------------------------------------------
  it(
    'should support synchronous call',
    context(async (host, service, client) => {
      const add = await client.call('basic:add', 1, 2)
      const sub = await client.call('basic:sub', 1, 2)
      const mul = await client.call('basic:mul', 1, 2)
      const div = await client.call('basic:div', 1, 2)
      Assert.equal(add, 3)
      Assert.equal(sub, -1)
      Assert.equal(mul, 2)
      Assert.equal(div, 0.5)
    }),
  )

  it(
    'should support asynchronous call',
    context(async (host, service, client) => {
      const [add, sub, mul, div] = await Promise.all([client.call('basic:add', 1, 2), client.call('basic:sub', 1, 2), client.call('basic:mul', 1, 2), client.call('basic:div', 1, 2)])
      Assert.equal(add, 3)
      Assert.equal(sub, -1)
      Assert.equal(mul, 2)
      Assert.equal(div, 0.5)
    }),
  )

  it(
    'should throw when call() is passed invalid method',
    context(async (host, service, client) => {
      // @ts-ignore
      await Assert.throwsAsync(async () => await client.call('foo', 1, 2))
    }),
  )

  // ------------------------------------------------------------------
  // Send()
  // ------------------------------------------------------------------
  it(
    'should store and fetch with send()',
    context(async (host, service, client) => {
      const value = Assert.randomUUID()
      client.send('send:store', value)
      const result = await client.call('send:fetch')
      Assert.equal(value, result)
    }),
  )

  it(
    'should support synchronous send()',
    context(async (host, service, client) => {
      client.send('basic:add', 1, 2)
      client.send('basic:sub', 1, 2)
      client.send('basic:mul', 1, 2)
      client.send('basic:div', 1, 2)
    }),
  )

  it(
    'should support asynchronous send()',
    context(async (host, service, client) => {
      await Promise.all([client.send('basic:add', 1, 2), client.send('basic:sub', 1, 2), client.send('basic:mul', 1, 2), client.send('basic:div', 1, 2)])
    }),
  )

  it(
    'should throw when send() is passed invalid method',
    context(async (host, service, client) => {
      // @ts-ignore
      Assert.throws(() => client.send('foo', 1, 2))
    }),
  )

  it(
    'should not throw when send() is passed invalid parameters',
    context(async (host, service, client) => {
      // @ts-ignore
      client.send('basic:add', 'hello', 'world')
    }),
  )

  // ------------------------------------------------------------------
  // Error: Explicit Close
  // ------------------------------------------------------------------
  it(
    'should throw error when call() in disconnected state (UniSocket)',
    context(async (host, service, client) => {
      const add = await client.call('basic:add', 1, 2)
      Assert.equal(add, 3)
      client.close()
      await Assert.throwsAsync(async () => await client.call('basic:add', 1, 2))
    }),
  )

  it(
    'should not throw error when send() in disconnected state (UniSocket)',
    context(async (host, service, client) => {
      const add = await client.call('basic:add', 1, 2)
      Assert.equal(add, 3)
      client.close()
      await client.send('basic:add', 1, 2)
    }),
  )

  it(
    'should throw error when call() in disconnected state (RetrySocket)',
    context(
      async (host, service, client) => {
        const add = await client.call('basic:add', 1, 2)
        Assert.equal(add, 3)
        client.close()
        await Assert.throwsAsync(async () => await client.call('basic:add', 1, 2))
      },
      {
        autoReconnectEnabled: true,
        autoReconnectBuffer: true,
        autoReconnectTimeout: 1000,
      },
    ),
  )

  it(
    'should not throw error when send() in disconnected state (RetrySocket)',
    context(
      async (host, service, client) => {
        const add = await client.call('basic:add', 1, 2)
        Assert.equal(add, 3)
        client.close()
        await client.send('basic:add', 1, 2)
      },
      {
        autoReconnectEnabled: true,
        autoReconnectBuffer: true,
        autoReconnectTimeout: 1000,
      },
    ),
  )

  // ------------------------------------------------------------------
  // Duplex
  // ------------------------------------------------------------------
  it(
    'should support duplex echo call from client to server to client',
    context(async (host, service, client) => {
      client.method('duplex:echo', (message) => message)
      const message = 'hello world'
      const result = await client.call('duplex:echo', 'hello world')
      Assert.equal(message, result)
    }),
  )

  it(
    'should support duplex streaming from server to client',
    context(async (host, service, client) => {
      let count = 0
      client.method('duplex:stream', () => {
        count = count + 1
      })
      await client.call('duplex:stream', 128)
      Assert.equal(count, 128)
    }),
  )

  // ------------------------------------------------------------------
  // Errors and Exceptions
  // ------------------------------------------------------------------
  it(
    'should throw "Internal Server Error" exceptions for thrown native JavaScript errors',
    context(async (host, service, client) => {
      try {
        await client.call('errors:error')
      } catch (error) {
        if (!(error instanceof Exception)) throw Error('Excepted Exception')
        Assert.equal(error.message, 'Internal Server Error')
        Assert.equal(error.code, -32001)
      }
    }),
  )

  it(
    'should throw a "Custom Error" exceptions for Exception thrown errors',
    context(async (host, service, client) => {
      try {
        await client.call('errors:exception')
      } catch (error) {
        if (!(error instanceof Exception)) throw Error('Excepted Exception')
        Assert.equal(error.message, 'boom')
        Assert.equal(error.code, 3000)
      }
    }),
  )

  // ------------------------------------------------------------------
  // Void
  // ------------------------------------------------------------------
  it(
    'should allow callers to pass void parameters',
    context(async (host, service, client) => {
      const result = await client.call('void:in', void 0)
      Assert.equal(result, true)
    }),
  )

  it(
    'should allow services to return void as null',
    context(async (host, service, client) => {
      const result = await client.call('void:out', 1)
      Assert.equal(result, null)
    }),
  )

  it(
    'should allow callers to echo void in and out',
    context(async (host, service, client) => {
      client.method('void:inout', (data) => data)
      const result = await client.call('void:inout', void 0)
      Assert.equal(result, null)
    }),
  )

  // --------------------------------------------------------------------------
  // Lifetime Events (note: transport error events are difficult to simulate)
  // --------------------------------------------------------------------------
  it(
    'should raise lifetime events in order (client close)',
    context(async (host, service, _client, port) => {
      const client = new WebSocketClient(Contract, `ws://localhost:${port}`)
      const buffer = [] as string[]
      client.event('connect', () => buffer.push('connect'))
      client.event('close', () => buffer.push('close'))
      await client.call('basic:add', 1, 1)
      client.close()
      await Assert.delay(50)
      Assert.deepEqual(buffer, ['connect', 'close'])
    }),
  )

  it(
    'should raise lifetime events in order (host close)',
    context(async (host, service, _client, port) => {
      const buffer = [] as string[]
      const client = new WebSocketClient(Contract, `ws://localhost:${port}`)
      client.event('connect', () => buffer.push('connect'))
      client.event('close', () => buffer.push('close'))
      await client.call('basic:add', 1, 2)
      await host.dispose()
      await Assert.delay(50)
      Assert.deepEqual(buffer, ['connect', 'close'])
    }),
  )
})
