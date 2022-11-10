import { SyncChannel } from '@sidewinder/channel'
import { Assert } from '../assert/index'

describe('channel/SyncChannel', () => {
  it('Should send value and end', () => {
    const channel = new SyncChannel()
    channel.send(0)
    channel.end()
  })

  it('Should send value, error and end without throw', () => {
    const channel = new SyncChannel()
    channel.send(0)
    channel.error(new Error('error'))
    channel.end()
  })

  it('Should receive next value then end', async () => {
    const channel = new SyncChannel()
    Assert.intoAsync(async () => {
      await channel.send(0)
      await channel.end()
    })

    const value = await channel.next()
    const eof = await channel.end()
    Assert.equal(value, 0)
    Assert.equal(eof, null)
  })

  it('Should receive next values then end', async () => {
    const channel = new SyncChannel()
    Assert.intoAsync(async () => {
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
    Assert.equal(value0, 0)
    Assert.equal(value1, 1)
    Assert.equal(value2, 2)
    Assert.equal(value3, 3)
    Assert.equal(eof, null)
  })

  it('Should throw on receive if send error', async () => {
    const channel = new SyncChannel()
    Assert.intoAsync(async () => {
      await channel.send(0)
      await channel.send(1)
      await channel.error(new Error())
    })

    const value0 = await channel.next()
    const value1 = await channel.next()
    const value2 = await channel.next().catch((error) => error)
    Assert.equal(value0, 0)
    Assert.equal(value1, 1)
    Assert.isInstanceOf(value2, Error)
  })

  it('Should end on receiver immediately following an error', async () => {
    const channel = new SyncChannel()
    Assert.intoAsync(async () => {
      await channel.send(0)
      await channel.send(1)
      await channel.error(new Error())
    })

    const value0 = await channel.next()
    const value1 = await channel.next()
    const value2 = await channel.next().catch((error) => error)
    const eof = await channel.next()
    Assert.equal(value0, 0)
    Assert.equal(value1, 1)
    Assert.isInstanceOf(value2, Error)
    Assert.equal(eof, null)
  })

  it('Should receive eof for all subsequent reads on an ended channel', async () => {
    const channel = new SyncChannel()
    Assert.intoAsync(async () => {
      await channel.send(0)
      await channel.send(1)
      await channel.end()
    })
    const value0 = await channel.next()
    const value1 = await channel.next()
    const eof0 = await channel.next()
    const eof1 = await channel.next()
    Assert.equal(value0, 0)
    Assert.equal(value1, 1)
    Assert.equal(eof0, null)
    Assert.equal(eof1, null)
  })

  // -----------------------------------------------------------------
  // Specialized
  // -----------------------------------------------------------------

  it('Should timeout on send if there are no receivers', async () => {
    const channel = new SyncChannel(1)
    await channel.send(0)
    await Assert.timeout(() => channel.send(1))
  }).timeout(1000)

  it('Should timeout on receive if there are no senders', async () => {
    const channel = new SyncChannel(1)
    await Assert.timeout(() => channel.next())
  }).timeout(1000)
})
