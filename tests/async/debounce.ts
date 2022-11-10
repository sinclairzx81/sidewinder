import { Debounce } from '@sidewinder/async'
import { Assert } from '../assert/index'

describe('async/Debounce', () => {
  // -------------------------------------------------------
  // Sync
  // -------------------------------------------------------
  it('Should should run non-deferred sync', async () => {
    const debounce = new Debounce(10, false)
    const buffer: number[] = []
    for (let i = 0; i < 10; i++) {
      debounce.run(() => buffer.push(i))
    }
    Assert.deepEqual(buffer, [0])
  })

  it('Should should run deferred sync', async () => {
    const debounce = new Debounce(10, true)
    const buffer: number[] = []
    for (let i = 0; i < 10; i++) {
      debounce.run(() => buffer.push(i))
    }
    await Assert.delay(20)
    Assert.deepEqual(buffer, [0, 9])
  })

  it('Should raise non-deferred error callback for sync', async () => {
    const debounce = new Debounce(10, false)
    let value: any = null
    debounce.run(
      () => {
        throw 'error'
      },
      (error) => {
        value = error
      },
    )
    await Assert.delay(1)
    Assert.notEqual(value, null)
  })

  it('Should raise deferred error callback for sync', async () => {
    const debounce = new Debounce(10, true)
    let value: any = null
    debounce.run(
      () => {
        throw 'error'
      },
      (error) => {
        value = error
      },
    )
    await Assert.delay(1)
    Assert.notEqual(value, null)
  })

  // -------------------------------------------------------
  // Async
  // -------------------------------------------------------

  it('Should should run non-deferred async', async () => {
    const debounce = new Debounce(10, false)
    const buffer: number[] = []
    for (let i = 0; i < 10; i++) {
      debounce.run(async () => buffer.push(i))
    }
    Assert.deepEqual(buffer, [0])
  })

  it('Should should run deferred async', async () => {
    const debounce = new Debounce(10, true)
    const buffer: number[] = []
    for (let i = 0; i < 10; i++) {
      debounce.run(async () => buffer.push(i))
    }
    await Assert.delay(20)
    Assert.deepEqual(buffer, [0, 9])
  })

  it('Should raise non-deferred error callback for async', async () => {
    const debounce = new Debounce(10, false)
    let value: any = null
    debounce.run(
      async () => {
        throw 'error'
      },
      (error) => {
        value = error
      },
    )
    await Assert.delay(1)
    Assert.notEqual(value, null)
  })

  it('Should raise deferred error callback for async', async () => {
    const debounce = new Debounce(10, true)
    let value: any = null
    debounce.run(
      async () => {
        throw 'error'
      },
      (error) => {
        value = error
      },
    )
    await Assert.delay(1)
    Assert.notEqual(value, null)
  })
})
