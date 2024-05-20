import { Mutex, Delay } from '@sidewinder/async'
import { Assert } from '../assert/index'

export const range = (length: number) => Array.from({ length })

describe('async/Mutex', () => {
  // ----------------------------------------------------------------
  // Concurrency
  // ----------------------------------------------------------------
  async function concurrencyTest(iterations: number) {
    const mutex = new Mutex()
    const expect = range(iterations).map((_, i) => i)
    const result = [] as number[]
    const tasks = range(iterations).map(async (_, index) => {
      const lock = await mutex.lock()
      result.push(index)
      await Delay.wait(Math.floor(Math.random() * 10))
      lock.dispose()
    })
    await Promise.all(tasks)
    Assert.deepEqual(result, expect)
  }
  it('It run with a concurrency of 1', async () => {
    await concurrencyTest(32)
  })
  it('It run with a concurrency of 16', async () => {
    await concurrencyTest(32)
  })
})
