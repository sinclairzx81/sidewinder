import { Type, Exception } from '@sidewinder/contract'
import { Host, WebSocketService } from '@sidewinder/server'
import { WebSocketClient, WebSocketClientOptions } from '@sidewinder/client'
import * as assert from '../../assert/index'

export type ContextCallback = (host: Host, service: WebSocketService<typeof Contract>, client: WebSocketClient<typeof Contract>) => Promise<void>

const Contract = Type.Contract({
    format: 'json',
    server: {
        error: Type.Function([], Type.Any()),
        exception: Type.Function([], Type.Any()),
        echo: Type.Function([Type.String()], Type.String()),
        store: Type.Function([Type.String()], Type.Any()),
        fetch: Type.Function([], Type.String()),
        add: Type.Function([Type.Number(), Type.Number()], Type.Number()),
        sub: Type.Function([Type.Number(), Type.Number()], Type.Number()),
        mul: Type.Function([Type.Number(), Type.Number()], Type.Number()),
        div: Type.Function([Type.Number(), Type.Number()], Type.Number()),
    },
    client: {
        echo: Type.Function([Type.String()], Type.String())
    }
})

function context(callback: ContextCallback, options?: WebSocketClientOptions) {
    return async () => {
        let store: string = ''
        const service = new WebSocketService(Contract)
        service.method('echo', async (clientId, message) => await service.call(clientId, 'echo', message))
        service.method('store', (clientId, data) => { store = data })
        service.method('fetch', (clientId) => store)
        service.method('error', (clientId) => { throw Error('boom' )})
        service.method('exception', (clientId) => { throw new Exception('boom', 3000, {})})
        service.method('add', (clientId, a, b) => a + b)
        service.method('sub', (clientId, a, b) => a - b)
        service.method('mul', (clientId, a, b) => a * b)
        service.method('div', (clientId, a, b) => a / b)
        
        const host = new Host()
        host.use(service)
        await host.listen(5000)

        const client = new WebSocketClient(Contract, 'ws://localhost:5000', options)
        
        await callback(host, service, client)
        client.close()
        await host.dispose()
        await assert.delay(50)
    }
}

describe('client/WebSocketClient:MsgPack', () => {

    // ------------------------------------------------------------------
    // Call()
    // ------------------------------------------------------------------

    it('should support synchronous call', context(async (host, service, client) => {
        const add = await client.call('add', 1, 2)
        const sub = await client.call('sub', 1, 2)
        const mul = await client.call('mul', 1, 2)
        const div = await client.call('div', 1, 2)
        assert.equal(add, 3)
        assert.equal(sub, -1)
        assert.equal(mul, 2)
        assert.equal(div, 0.5)
    }))

    it('should support asynchronous call', context(async (host, service, client) => {
        const [add, sub, mul, div] = await Promise.all([
            client.call('add', 1, 2),
            client.call('sub', 1, 2),
            client.call('mul', 1, 2),
            client.call('div', 1, 2)
        ])
        assert.equal(add, 3)
        assert.equal(sub, -1)
        assert.equal(mul, 2)
        assert.equal(div, 0.5)
    }))

    it('should throw when call() is passed invalid method', context(async (host, service, client) => {
        // @ts-ignore
        await assert.throwsAsync(async () => await client.call('foo', 1, 2))
    }))

    // ------------------------------------------------------------------
    // Send()
    // ------------------------------------------------------------------

    it('should store and fetch with send()',context(async (host, service, client) => {
        const value = assert.random()
        client.send('store', value)
        const result = await client.call('fetch')
        assert.equal(value, result)
    }))

    it('should support synchronous send()', context(async (host, service, client) => {
        client.send('add', 1, 2)
        client.send('sub', 1, 2)
        client.send('mul', 1, 2)
        client.send('div', 1, 2)
    }))

    it('should support asynchronous send()', context(async (host, service, client) => {
        await Promise.all([
            client.send('add', 1, 2),
            client.send('sub', 1, 2),
            client.send('mul', 1, 2),
            client.send('div', 1, 2)
        ])
    }))

    it('should throw when send() is passed invalid method', context(async (host, service, client) => {
        // @ts-ignore
        assert.throws(() => client.send('foo', 1, 2))
    }))

    it('should not throw when send() is passed invalid parameters', context(async (host, service, client) => {
        // @ts-ignore
        client.send('add', 'hello', 'world')
    }))


    // ------------------------------------------------------------------
    // Error: Explicit Close
    // ------------------------------------------------------------------

    it('should throw error when call() in disconnected state (UniSocket)', context(async (host, service, client) => {
        const add = await client.call('add', 1, 2)
        assert.equal(add, 3)
        client.close()
        await assert.throwsAsync(async () => await client.call('add', 1, 2))
    }))

    it('should not throw error when send() in disconnected state (UniSocket)', context(async (host, service, client) => {
        const add = await client.call('add', 1, 2)
        assert.equal(add, 3)
        client.close()
        await client.send('add', 1, 2)
    }))


    it('should throw error when call() in disconnected state (RetrySocket)', context(async (host, service, client) => {
        const add = await client.call('add', 1, 2)
        assert.equal(add, 3)
        client.close()
        await assert.throwsAsync(async () => await client.call('add', 1, 2))

    }, {
        autoReconnectEnabled: true,
        autoReconnectBuffer: true,
        autoReconnectTimeout: 1000
    }))

    it('should not throw error when send() in disconnected state (RetrySocket)', context(async (host, service, client) => {
        const add = await client.call('add', 1, 2)
        assert.equal(add, 3)
        client.close()
        await client.send('add', 1, 2)
    }, {
        autoReconnectEnabled: true,
        autoReconnectBuffer: true,
        autoReconnectTimeout: 1000
    }))


    // ------------------------------------------------------------------
    // Duplex
    // ------------------------------------------------------------------

    it('should support duplex echo call from client to server to client', context(async (host, service, client) => {
        client.method('echo', message =>  message)
        const message = 'hello world'
        const result = await client.call('echo', 'hello world')
        assert.equal(message, result)
    }))

    // ------------------------------------------------------------------
    // Errors and Exceptions
    // ------------------------------------------------------------------

    it('should throw "Internal Server Error" exceptions for thrown native JavaScript errors', context(async (host, service, client) => {
        try {
            await client.call('error')
        } catch(error) {
            if(!(error instanceof Exception)) throw Error('Excepted Exception')
            assert.equal(error.message, 'Internal Server Error')
            assert.equal(error.code, -32001)
        }
    }))

    it('should throw a "Custom Error" exceptions for Exception thrown errors', context(async (host, service, client) => {
        try {
            await client.call('exception')
        } catch(error) {
            if(!(error instanceof Exception)) throw Error('Excepted Exception')
            assert.equal(error.message, 'boom')
            assert.equal(error.code, 3000)
        }
    }))
})