import { Type } from '@sidewinder/contract'
import { Host, WebSocketService } from '@sidewinder/server'
import { WebSocketClient } from '@sidewinder/client'
import * as assert from '../assert/index'


const Contract = Type.Contract({
    server: {
        'test': Type.Function([], Type.Void())
    }
})

describe('server/WebSocketService', () => {
    // ------------------------------------------------------------------
    // Lifetimes
    // ------------------------------------------------------------------
    it('should dispatch lifetime events', async () => {
        const buffer = [] as any[]
        const port = assert.nextPort()
        const service = new WebSocketService(Contract)
        service.event('authorize', (clientId, request) => { buffer.push('server:authorize'); return clientId })
        service.event('connect', (context) => { buffer.push('server:connect') })
        service.method('test', (context) => { buffer.push('server:call') })
        service.event('close', (context) => { buffer.push('server:close') })

        const host = new Host()
        host.use(service)
        host.listen(port)

        const client = new WebSocketClient(Contract, `ws://localhost:${port}`)
        await client.call('test')
        client.close()
        await host.dispose()

        assert.deepEqual(buffer, [
            'server:authorize',
            'server:connect',
            'server:call',
            'server:close'
        ])
    })
    it('should dispatch multiple lifetime events for subsequent calls', async () => {
        const buffer = [] as any[]
        const port = assert.nextPort()
        const service = new WebSocketService(Contract)
        service.event('authorize', (clientId, request) => { buffer.push('server:authorize'); return clientId })
        service.event('connect', (context) => { buffer.push('server:connect') })
        service.method('test', (context) => { buffer.push('server:call') })
        service.event('close', (context) => { buffer.push('server:close') })

        const host = new Host()
        host.use(service)
        host.listen(port)

        const client = new WebSocketClient(Contract, `ws://localhost:${port}`)
        await client.call('test')
        await client.call('test')
        await client.call('test')
        await client.call('test')
        client.close()
        await host.dispose()

        assert.deepEqual(buffer, [
            'server:authorize',
            'server:connect',
            'server:call',
            'server:call',
            'server:call',
            'server:call',
            'server:close',
        ])
    })

    it('should dispatch only authorize event on authorization fail', async () => {
        const buffer = [] as any[]
        const port = assert.nextPort()
        const service = new WebSocketService(Contract)
        service.event('authorize', (clientId, request) => { buffer.push('server:authorize'); throw 1 })
        service.event('connect', (context) => { buffer.push('server:connect') })
        service.method('test', (context) => { buffer.push('server:call') })
        service.event('close', (context) => { buffer.push('server:close') })

        const host = new Host()
        host.use(service)
        host.listen(port)

        const client = new WebSocketClient(Contract, `ws://localhost:${port}`)
        await client.call('test').catch(() => buffer.push('client:error'))
        client.close()
        await host.dispose()

        assert.deepEqual(buffer, [
            'server:authorize',
            'client:error'
        ])
    })

    // ------------------------------------------------------------------
    // Error Handling
    // ------------------------------------------------------------------

    it('should not crash service on synchronous error', async () => {
        const buffer = [] as any[]
        const port = assert.nextPort()
        const service = new WebSocketService(Contract)
        service.method('test', (context) => { throw Error() })
        const host = new Host()
        host.use(service)
        host.listen(port)

        const client = new WebSocketClient(Contract, `ws://localhost:${port}`)
        await client.call('test').catch(() => buffer.push('client:error'))
        await client.call('test').catch(() => buffer.push('client:error'))
        await client.call('test').catch(() => buffer.push('client:error'))
        await client.call('test').catch(() => buffer.push('client:error'))
        client.close()
        await host.dispose()

        assert.deepEqual(buffer, [
            'client:error',
            'client:error',
            'client:error',
            'client:error'
        ])
    })

    it('should not crash on service asynchronous error', async () => {
        const buffer = [] as any[]
        const port = assert.nextPort()
        const service = new WebSocketService(Contract)
        service.method('test', async (context) => { throw Error() })

        const host = new Host()
        host.use(service)
        host.listen(port)

        const client = new WebSocketClient(Contract, `ws://localhost:${port}`)
        await client.call('test').catch(() => buffer.push('client:error'))
        await client.call('test').catch(() => buffer.push('client:error'))
        await client.call('test').catch(() => buffer.push('client:error'))
        await client.call('test').catch(() => buffer.push('client:error'))
        client.close()
        await host.dispose()
        assert.deepEqual(buffer, [
            'client:error', 
            'client:error',
            'client:error',
            'client:error'
        ])
    })

    // ------------------------------------------------------------------
    // Context
    // ------------------------------------------------------------------

    it('should construct context on authorize and propagate to lifetime events', async () => {
        const buffer = [] as any[]
        const port = assert.nextPort()
        const Context = Type.Object({ x: Type.Number(), y: Type.Number(), z: Type.Number() })
        const service = new WebSocketService(Contract, Context)
        service.event('authorize', () => { return { x: 1, y: 2, z: 3 } })
        service.event('connect', (context) => buffer.push(['server:connect', context]))
        service.event('close', (context) => buffer.push(['server:close', context]))
        service.method('test', (context) => { buffer.push(['server:call', context]) })

        const host = new Host()
        host.use(service)
        host.listen(port)

        const client = new WebSocketClient(Contract, `ws://localhost:${port}`)
        await client.call('test').catch(() => { })
        await client.call('test').catch(() => { })
        await client.call('test').catch(() => { })
        await client.call('test').catch(() => { })
        client.close()
        await host.dispose()
        assert.deepEqual(buffer, [
            ['server:connect', { x: 1, y: 2, z: 3 }],
            ['server:call', { x: 1, y: 2, z: 3 }],
            ['server:call', { x: 1, y: 2, z: 3 }],
            ['server:call', { x: 1, y: 2, z: 3 }],
            ['server:call', { x: 1, y: 2, z: 3 }],
            ['server:close', { x: 1, y: 2, z: 3 }],
        ])
    })

    it('should disconnect on service failure to construct context', async () => {
        const buffer = [] as any[]
        const port = assert.nextPort()
        const Context = Type.Object({ x: Type.Number(), y: Type.Number(), z: Type.Number() })
        const service = new WebSocketService(Contract, Context)
        // @ts-ignore
        service.event('authorize', () => { return { x: 1, y: 2 } })
        service.event('connect', () => buffer.push('server:connect'))
        service.event('close', () => buffer.push('server:close'))
        service.method('test', (context) => { buffer.push('server:call') })

        const host = new Host()
        host.use(service)
        host.listen(port)

        const client = new WebSocketClient(Contract, `ws://localhost:${port}`)
        await client.call('test').catch(() => buffer.push('client:error'))
        await client.call('test').catch(() => buffer.push('client:error'))
        await client.call('test').catch(() => buffer.push('client:error'))
        await client.call('test').catch(() => buffer.push('client:error'))

        client.close()
        await host.dispose()
        assert.deepEqual(buffer, [
            'client:error',
            'client:error',
            'client:error',
            'client:error',
        ])
    })
})