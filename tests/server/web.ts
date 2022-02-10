import { Type } from '@sidewinder/contract'
import { Host, WebService } from '@sidewinder/server'
import { WebClient } from '@sidewinder/client'
import * as assert from '../assert/index'


const Contract = Type.Contract({
    server: {
        'test': Type.Function([], Type.Void())
    }
})

describe('server/WebService', () => {
    // ------------------------------------------------------------------
    // Lifetimes
    // ------------------------------------------------------------------
    it('should dispatch lifetime events', async () => {
        const buffer  = [] as any[]
        const port    = assert.nextPort()
        const service = new WebService(Contract)
        service.event('authorize', (clientId, request) => { buffer.push('authorize'); return true})
        service.event('connect', (clientId) => { buffer.push('connect') })
        service.method('test', (clientId) => { buffer.push('call') })
        service.event('close', (clientId) => { buffer.push('close') })

        const host = new Host()
        host.use(service)
        host.listen(port)

        const client = new WebClient(Contract, `http://localhost:${port}`)
        await client.call('test')
        await host.dispose()

        assert.deepEqual(buffer, [
            'authorize', 'connect', 'call', 'close'
        ])
    })
    it('should dispatch lifetime events for subsequent requests', async () => {
        const buffer  = [] as any[]
        const port    = assert.nextPort()
        const service = new WebService(Contract)
        service.event('authorize', (clientId, request) => { buffer.push('authorize'); return true})
        service.event('connect', (clientId) => { buffer.push('connect') })
        service.method('test', (clientId) => { buffer.push('call') })
        service.event('close', (clientId) => { buffer.push('close') })

        const host = new Host()
        host.use(service)
        host.listen(port)

        const client = new WebClient(Contract, `http://localhost:${port}`)
        await client.call('test')
        await client.call('test')
        await host.dispose()

        assert.deepEqual(buffer, [
            'authorize', 'connect', 'call', 'close',
            'authorize', 'connect', 'call', 'close'
        ])
    })

    it('should terminate on authorize false', async () => {
        const buffer  = [] as any[]
        const port    = assert.nextPort()
        const service = new WebService(Contract)
        service.event('authorize', (clientId, request) => { buffer.push('authorize'); return false })
        service.event('connect', (clientId) => { buffer.push('connect') })
        service.method('test', (clientId) => { buffer.push('call') })
        service.event('close', (clientId) => { buffer.push('close') })

        const host = new Host()
        host.use(service)
        host.listen(port)

        const client = new WebClient(Contract, `http://localhost:${port}`)
        await client.call('test').catch(() => buffer.push('error'))
        await host.dispose()
        
        assert.deepEqual(buffer, [
            'authorize', 'error'
        ])
    })
    // ------------------------------------------------------------------
    // Errors
    // ------------------------------------------------------------------
    it('should not crash on synchronous error', async () => {
        const buffer  = [] as any[]
        const port    = assert.nextPort()
        const service = new WebService(Contract)
        service.method('test', (clientId) => { throw Error() })

        const host = new Host()
        host.use(service)
        host.listen(port)

        const client = new WebClient(Contract, `http://localhost:${port}`)
        await client.call('test').catch(() => buffer.push('error'))
        await client.call('test').catch(() => buffer.push('error'))
        await client.call('test').catch(() => buffer.push('error'))
        await client.call('test').catch(() => buffer.push('error'))
        await host.dispose()
        
        assert.deepEqual(buffer, [
            'error', 'error', 'error', 'error'
        ])
    })
    it('should not crash on asynchronous error', async () => {
        const buffer  = [] as any[]
        const port    = assert.nextPort()
        const service = new WebService(Contract)
        service.method('test', async (clientId) => { throw Error() })

        const host = new Host()
        host.use(service)
        host.listen(port)

        const client = new WebClient(Contract, `http://localhost:${port}`)
        await client.call('test').catch(() => buffer.push('error'))
        await client.call('test').catch(() => buffer.push('error'))
        await client.call('test').catch(() => buffer.push('error'))
        await client.call('test').catch(() => buffer.push('error'))
        await host.dispose()
        
        assert.deepEqual(buffer, [
            'error', 'error', 'error', 'error'
        ])
    })
    // ------------------------------------------------------------------
    // Context Mapping
    // ------------------------------------------------------------------
    it('should support context mapping the clientId', async () => {
        const buffer  = [] as any[]
        const port    = assert.nextPort()
        const service = new WebService(Contract)
        service.method('test', (clientId) => [1, 2, 3], async (data) => { buffer.push(data) })

        const host = new Host()
        host.use(service)
        host.listen(port)

        const client = new WebClient(Contract, `http://localhost:${port}`)
        await client.call('test').catch(() => buffer.push('error'))
        await host.dispose()
        
        assert.deepEqual(buffer, [
            [1, 2, 3]
        ])
    })
})