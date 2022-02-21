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
        service.event('authorize', (context, request) => { buffer.push('authorize'); return context })
        service.event('connect', (context) => { buffer.push('connect') })
        service.method('test', (context) => { buffer.push('call') })
        service.event('close', (context) => { buffer.push('close') })

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
        service.event('authorize', (context, request) => { buffer.push('authorize'); return context })
        service.event('connect', (context) => { buffer.push('connect') })
        service.method('test', (context) => { buffer.push('call') })
        service.event('close', (context) => { buffer.push('close') })

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

    it('should terminate on failed authorize', async () => {
        const buffer  = [] as any[]
        const port    = assert.nextPort()
        const service = new WebService(Contract)
        service.event('authorize', (context, request) => { buffer.push('authorize'); throw Error('No') })
        service.event('connect', (context) => { buffer.push('connect') })
        service.method('test', (context) => { buffer.push('call') })
        service.event('close', (context) => { buffer.push('close') })

        const host = new Host()
        host.use(service)
        host.listen(port)

        const client = new WebClient(Contract, `http://localhost:${port}`)
        await client.call('test').catch(() => buffer.push('error'))
        await host.dispose()
        
        assert.deepEqual(buffer, [
            'authorize', // server
            'error'      // client
        ])
    })
    // ------------------------------------------------------------------
    // Errors
    // ------------------------------------------------------------------
    it('should not crash on synchronous error', async () => {
        const buffer  = [] as any[]
        const port    = assert.nextPort()
        const service = new WebService(Contract)
        service.method('test', (context) => { throw Error() })

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
        service.method('test', async (context) => { throw Error() })

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
    // Contexts
    // ------------------------------------------------------------------
    
    it('should forward service level context into method', async () => {
        const buffer  = [] as any[]
        const port    = assert.nextPort()
        const context = Type.Tuple([Type.Number(), Type.Number(), Type.Number()])
        const service = new WebService(Contract, context)
        service.event('authorize', () => [1, 2, 3])
        service.method('test', (context) => { buffer.push(context) })

        const host = new Host()
        host.use(service)
        host.listen(port)

        const client = new WebClient(Contract, `http://localhost:${port}`)
        await client.call('test')
        await host.dispose()
        assert.deepEqual(buffer[0], [1, 2, 3])
    })

    it('should forward method level context into method', async () => {
        const buffer  = [] as any[]
        const port    = assert.nextPort()
        const service = new WebService(Contract)
        service.method('test', () => [1, 2, 3], (context) => { buffer.push(context) })

        const host = new Host()
        host.use(service)
        host.listen(port)
        
        const client = new WebClient(Contract, `http://localhost:${port}`)
        await client.call('test')
        await host.dispose()
        assert.deepEqual(buffer[0], [1, 2, 3])
    })

    it('should forward service and method level context into method', async () => {
        const buffer  = [] as any[]
        const port    = assert.nextPort()
        const context = Type.Tuple([Type.Number(), Type.Number(), Type.Number()])
        const service = new WebService(Contract, context)
        service.event('authorize', () => [1, 2, 3])
        service.method('test', (context) => [...context, 4, 5, 6], (context) => { buffer.push(context) })

        const host = new Host()
        host.use(service)
        host.listen(port)
        
        const client = new WebClient(Contract, `http://localhost:${port}`)
        await client.call('test')
        await host.dispose()
        assert.deepEqual(buffer[0], [1, 2, 3, 4, 5, 6])
    })

})