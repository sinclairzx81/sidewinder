import { Type, Exception } from '@sidewinder/contract'
import { Host, WebService } from '@sidewinder/server'
import { WebClient } from '@sidewinder/client'
import * as assert from '../../assert/index'
import { nextPort } from '../port'

export type ContextCallback = (host: Host, service: WebService<typeof Contract>, client: WebClient<typeof Contract>) => Promise<void>

const Contract = Type.Contract({
    format: 'msgpack',
    server: {
        'errors:error':     Type.Function([], Type.Any()),
        'errors:exception': Type.Function([], Type.Any()),
        'send:store':       Type.Function([Type.String()], Type.Any()),
        'send:fetch':       Type.Function([], Type.String()),
        'void:in':          Type.Function([Type.Void()],   Type.Boolean()),
        'void:out':         Type.Function([Type.Number()], Type.Void()),
        'basic:add':        Type.Function([Type.Number(), Type.Number()], Type.Number()),
        'basic:sub':        Type.Function([Type.Number(), Type.Number()], Type.Number()),
        'basic:mul':        Type.Function([Type.Number(), Type.Number()], Type.Number()),
        'basic:div':        Type.Function([Type.Number(), Type.Number()], Type.Number()),
    }
})

function context(callback: ContextCallback) {
    return async () => {
        const port = nextPort()
        let store: string = ''
        const service = new WebService(Contract)
        service.method('send:store',       (clientId, data) => { store = data })
        service.method('send:fetch',       (clientId) => store)
        service.method('errors:error',     (clientId) => { throw Error('boom' )})
        service.method('errors:exception', (clientId) => { throw new Exception('boom', 3000, {})})
        service.method('void:in',          (clientId, data) => data === null)
        service.method('void:out',         (clientId, data) => {})
        service.method('basic:add',        (clientId, a, b) => a + b)
        service.method('basic:sub',        (clientId, a, b) => a - b)
        service.method('basic:mul',        (clientId, a, b) => a * b)
        service.method('basic:div',        (clientId, a, b) => a / b)

        const host = new Host()
        host.use(service)
        await host.listen(port)

        const client = new WebClient(Contract, `http://localhost:${port}`)
        await callback(host, service, client)
        await host.dispose()
    }
}

describe('client/WebClient:Json', () => {

    // ------------------------------------------------------------------
    // Call()
    // ------------------------------------------------------------------

    it('Should support synchronous call', context(async (host, service, client) => {
        const add = await client.call('basic:add', 1, 2)
        const sub = await client.call('basic:sub', 1, 2)
        const mul = await client.call('basic:mul', 1, 2)
        const div = await client.call('basic:div', 1, 2)
        assert.equal(add, 3)
        assert.equal(sub, -1)
        assert.equal(mul, 2)
        assert.equal(div, 0.5)
    }))

    it('Should support asynchronous call', context(async (host, service, client) => {
        const [add, sub, mul, div] = await Promise.all([
            client.call('basic:add', 1, 2),
            client.call('basic:sub', 1, 2),
            client.call('basic:mul', 1, 2),
            client.call('basic:div', 1, 2)
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
        client.send('send:store', value)
        await assert.delay(5) // http requirement
        const result = await client.call('send:fetch')
        assert.equal(value, result)
    }))

    it('Should support synchronous send()', context(async (host, service, client) => {
        client.send('basic:add', 1, 2)
        client.send('basic:sub', 1, 2)
        client.send('basic:mul', 1, 2)
        client.send('basic:div', 1, 2)
    }))

    it('Should support asynchronous send()', context(async (host, service, client) => {
        await Promise.all([
            client.send('basic:add', 1, 2),
            client.send('basic:sub', 1, 2),
            client.send('basic:mul', 1, 2),
            client.send('basic:div', 1, 2)
        ])
    }))

    it('Should throw when send() is passed invalid method', context(async (host, service, client) => {
        // @ts-ignore
        assert.throws(() => client.send('foo', 1, 2))
    }))

    it('Should not throw when send() is passed invalid parameters', context(async (host, service, client) => {
        // @ts-ignore
        client.send('basic:add', 'hello', 'world')
    }))

    // ------------------------------------------------------------------
    // Errors and Exceptions
    // ------------------------------------------------------------------

    it('should throw "Internal Server Error" exceptions for thrown native JavaScript errors', context(async (host, service, client) => {
        try {
            await client.call('errors:error')
        } catch(error) {
            if(!(error instanceof Exception)) throw Error('Excepted Exception')
            assert.equal(error.message, 'Internal Server Error')
            assert.equal(error.code, -32001)
        }
    }))

    it('should throw a "Custom Error" exceptions for Exception thrown errors', context(async (host, service, client) => {
        try {
            await client.call('errors:exception')
        } catch(error) {
            if(!(error instanceof Exception)) throw Error('Excepted Exception')
            assert.equal(error.message, 'boom')
            assert.equal(error.code, 3000)
        }
    }))

    // ------------------------------------------------------------------
    // Void
    // ------------------------------------------------------------------

    it('should allow callers to pass void parameters', context(async (host, service, client) => {
        const result = await client.call('void:in', void 0)
        assert.equal(result, true)
    }))

    it('should allow services to return void as null', context(async (host, service, client) => {
        const result = await client.call('void:out', 1)
        assert.equal(result, null)
    }))
    
})