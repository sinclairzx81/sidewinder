import { Type, Exception } from '@sidewinder/contract'
import { Host, WebService } from '@sidewinder/server'
import { WebClient } from '@sidewinder/client'
import * as assert from '../../assert/index'

export type ContextCallback = (host: Host, service: WebService<typeof Contract>, client: WebClient<typeof Contract>) => Promise<void>

const Contract = Type.Contract({
    format: 'json',
    server: {
        error: Type.Function([], Type.Any()),
        exception: Type.Function([], Type.Any()),
        store: Type.Function([Type.String()], Type.Any()),
        fetch: Type.Function([], Type.String()),
        add: Type.Function([Type.Number(), Type.Number()], Type.Number()),
        sub: Type.Function([Type.Number(), Type.Number()], Type.Number()),
        mul: Type.Function([Type.Number(), Type.Number()], Type.Number()),
        div: Type.Function([Type.Number(), Type.Number()], Type.Number()),
    }
})

function context(callback: ContextCallback) {
    return async () => {
        let store: string = ''
        const service = new WebService(Contract)
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

        const client = new WebClient(Contract, 'http://localhost:5000')
        await callback(host, service, client)
        await host.dispose()
        await assert.delay(50)
    }
}

describe('client/WebClient:MsgPack', () => {

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
    
    it('should store and fetch with send()',context(async (host, service, client) => {
        const value = assert.random()
        client.send('store', value)
        await assert.delay(5) // http requirement
        const result = await client.call('fetch')
        assert.equal(value, result)
    }))

    it('Should support synchronous send()', context(async (host, service, client) => {
        client.send('add', 1, 2)
        client.send('sub', 1, 2)
        client.send('mul', 1, 2)
        client.send('div', 1, 2)
    }))

    it('Should support asynchronous send()', context(async (host, service, client) => {
        await Promise.all([
            client.send('add', 1, 2),
            client.send('sub', 1, 2),
            client.send('mul', 1, 2),
            client.send('div', 1, 2)
        ])
    }))

    it('Should throw when send() is passed invalid method', context(async (host, service, client) => {
        // @ts-ignore
        assert.throws(() => client.send('foo', 1, 2))
    }))

    it('Should not throw when send() is passed invalid parameters', context(async (host, service, client) => {
        // @ts-ignore
        client.send('add', 'hello', 'world')
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