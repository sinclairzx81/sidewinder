import { Type } from '@sidewinder/contract'
import { Host, WebSocketService } from '@sidewinder/server'
import { WebSocketClient, WebSocketClientOptions } from '@sidewinder/client'
import * as assert from '../assert/index'

export type ContextCallback = (host: Host, service: WebSocketService<typeof Contract>, client: WebSocketClient<typeof Contract>) => Promise<void>

const Contract = Type.Contract({
    server: {
        add: Type.Function([Type.Number(), Type.Number()], Type.Number()),
        sub: Type.Function([Type.Number(), Type.Number()], Type.Number()),
        mul: Type.Function([Type.Number(), Type.Number()], Type.Number()),
        div: Type.Function([Type.Number(), Type.Number()], Type.Number()),
    }
})

function context(callback: ContextCallback, options?: WebSocketClientOptions) {
    return async () => {
        const service = new WebSocketService(Contract)
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
    }
}

describe('client/WebSocketClient', () => {

    // ------------------------------------------------------------------
    // Call()
    // ------------------------------------------------------------------

    it('Should support synchronous call', context(async (host, service, client) => {
        const add = await client.call('add', 1, 2)
        const sub = await client.call('sub', 1, 2)
        const mul = await client.call('mul', 1, 2)
        const div = await client.call('div', 1, 2)
        assert.equal(add, 3)
        assert.equal(sub, -1)
        assert.equal(mul, 2)
        assert.equal(div, 0.5)
    }))

    it('Should support asynchronous call', context(async (host, service, client) => {
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

    it('Should throw when call() is passed invalid method', context(async (host, service, client) => {
        // @ts-ignore
        await assert.throwsAsync(async () => await client.call('foo', 1, 2))
    }))

    // ------------------------------------------------------------------
    // Send()
    // ------------------------------------------------------------------

    it('Should support synchronous send()', context(async (host, service, client) => {
        client.send('add', 1, 2)
        client.send('sub', 1, 2)
        client.send('mul', 1, 2)
        client.send('div', 1, 2)
    }))

    it('Should support asynchronous send()', context(async (host, service, client) => {
        const [add, sub, mul, div] = await Promise.all([
            client.send('add', 1, 2),
            client.send('sub', 1, 2),
            client.send('mul', 1, 2),
            client.send('div', 1, 2)
        ])
    }))

    it('Should not throw when send() is passed invalid method', context(async (host, service, client) => {
        // @ts-ignore
        client.send('foo', 1, 2)
    }))

    it('Should not throw when send() is passed invalid parameters', context(async (host, service, client) => {
        // @ts-ignore
        client.send('add', 'hello', 'world')
    }))


    // ------------------------------------------------------------------
    // Error: Explicit Close
    // ------------------------------------------------------------------

    it('Should throw error when call() in disconnected state (UniSocket)', context(async (host, service, client) => {
        const add = await client.call('add', 1, 2)
        assert.equal(add, 3)
        client.close()
        await assert.throwsAsync(async () => await client.call('add', 1, 2))
    }))

    it('Should not throw error when send() in disconnected state (UniSocket)', context(async (host, service, client) => {
        const add = await client.call('add', 1, 2)
        assert.equal(add, 3)
        client.close()
        await client.send('add', 1, 2)
    }))


    it('Should throw error when call() in disconnected state (RetrySocket)', context(async (host, service, client) => {
        const add = await client.call('add', 1, 2)
        assert.equal(add, 3)
        client.close()
        await assert.throwsAsync(async () => await client.call('add', 1, 2))

    }, {
        autoReconnectEnabled: true,
        autoReconnectBuffer: true,
        autoReconnectTimeout: 1000
    }))

    it('Should not throw error when send() in disconnected state (RetrySocket)', context(async (host, service, client) => {
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
    // RetrySocket
    // ------------------------------------------------------------------

    // it('[RetrySocket] Should throw when send() is called in disconnected state when autoReconnectBuffer is false', context(async (host, service, client) => {
    //     const add = await client.call('add', 1, 2)
    //     assert.equal(add, 3)
    //     await host.dispose()
    //     await client.send('add', 1, 2)
    // }, {
    //     autoReconnectEnabled: true,
    //     autoReconnectBuffer: false,
    //     autoReconnectTimeout: 1000
    // })).timeout(100000)

})