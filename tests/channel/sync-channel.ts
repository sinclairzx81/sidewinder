import { SyncChannel } from '@sidewinder/channel'
import * as assert from '../assert/index'

describe('channel/SyncChannel', () => {
    it('should send value and end', () => {
        const channel = new SyncChannel()
        channel.send(0)
        channel.end()
    })

    it('should send value, error and end without throw', () => {
        const channel = new SyncChannel()
        channel.send(0)
        channel.error(new Error('error'))
        channel.end()
    })

    it('should receive next value then end', async () => {
        const channel = new SyncChannel()
        assert.intoAsync(async () => {
            await channel.send(0)
            await channel.end()
        })
        
        const value = await channel.next()
        const eof = await channel.end()
        assert.equal(value, 0)
        assert.equal(eof, null)
    })

    it('should receive next values then end', async () => {
        const channel = new SyncChannel()
        assert.intoAsync(async () => {
            await channel.send(0)
            await channel.send(1)
            await channel.send(2)
            await channel.send(3)
            await channel.end()
        })

        const value0 = await channel.next()
        const value1 = await channel.next()
        const value2 = await channel.next()
        const value3 = await channel.next()
        const eof = await channel.next()
        assert.equal(value0, 0)
        assert.equal(value1, 1)
        assert.equal(value2, 2)
        assert.equal(value3, 3)
        assert.equal(eof, null)
    })

    it('should throw on receive if send error', async () => {
        const channel = new SyncChannel()
        assert.intoAsync(async () => {
            await channel.send(0)
            await channel.send(1)
            await channel.error(new Error())
        })

        const value0 = await channel.next()
        const value1 = await channel.next()
        const value2 = await channel.next().catch(error => error)
        assert.equal(value0, 0)
        assert.equal(value1, 1)
        assert.isInstanceOf(value2, Error)
    })

    it('should end on receiver immediately following an error', async () => {
        const channel = new SyncChannel()
        assert.intoAsync(async () => {
            await channel.send(0)
            await channel.send(1)
            await channel.error(new Error())
        })
        
        const value0 = await channel.next()
        const value1 = await channel.next()
        const value2 = await channel.next().catch(error => error)
        const eof = await channel.next()
        assert.equal(value0, 0)
        assert.equal(value1, 1)
        assert.isInstanceOf(value2, Error)
        assert.equal(eof, null)
    })

    it('should receive eof for all subsequent reads on an ended channel', async () => {
        const channel = new SyncChannel()
        assert.intoAsync(async () => {
            await channel.send(0)
            await channel.send(1)
            await channel.end()
        })
        const value0 = await channel.next()
        const value1 = await channel.next()
        const eof0 = await channel.next()
        const eof1 = await channel.next()
        assert.equal(value0, 0)
        assert.equal(value1, 1)
        assert.equal(eof0, null)
        assert.equal(eof1, null)
    })

    // -----------------------------------------------------------------
    // Specialized
    // -----------------------------------------------------------------
    
    it('should timeout on send if there are no receivers', async () => {
        const channel = new SyncChannel(1)
        await channel.send(0)
        await assert.timeout(() => channel.send(1))
    }).timeout(1000)

    it('should timeout on receive if there are no senders', async () => {
        const channel = new SyncChannel(1)
        await assert.timeout(() => channel.next())
    }).timeout(1000)
})