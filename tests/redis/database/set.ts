import { Assert } from '../../assert/index'
import { resolveDatabase } from '../resolve'

describe('redis/RedisSet', () => {
  // ---------------------------------------------------------
  // add
  // ---------------------------------------------------------

  it('should add values', async () => {
    const database = resolveDatabase()
    const set = database.set('vectors')
    await set.add([0, 0, 0])
    await set.add([1, 0, 0])
    await set.add([2, 0, 0])
    const size = await set.size()
    Assert.deepEqual(size, 3)
  })

  it('should add values with overlap', async () => {
    const database = resolveDatabase()
    const set = database.set('vectors')
    await set.add([0, 0, 0])
    await set.add([1, 0, 0])
    await set.add([2, 0, 0])
    await set.add([0, 0, 0])
    await set.add([1, 0, 0])
    await set.add([2, 0, 0])
    const size = await set.size()
    Assert.deepEqual(size, 3)
  })

  it('should get values with overlap', async () => {
    const database = resolveDatabase()
    const set = database.set('vectors')
    await set.add([0, 0, 0])
    await set.add([1, 0, 0])
    await set.add([2, 0, 0])
    await set.add([0, 0, 0])
    await set.add([1, 0, 0])
    await set.add([2, 0, 0])
    const size = await set.size()
    Assert.deepEqual(size, 3)
  })

  it('should return correct has values', async () => {
    const database = resolveDatabase()
    const set = database.set('vectors')
    await set.add([0, 0, 0])
    const value0 = await set.has([0, 0, 0])
    const value1 = await set.has([0, 0, 1])
    Assert.deepEqual(value0, true)
    Assert.deepEqual(value1, false)
  })

  it('should clear set', async () => {
    const database = resolveDatabase()
    const set = database.set('vectors')
    await set.add([0, 0, 0])
    await set.add([1, 0, 0])
    await set.add([2, 0, 0])
    await set.clear()
    const size = await set.size()
    Assert.deepEqual(size, 0)
  })

  // ---------------------------------------------------------
  // Iterator
  // ---------------------------------------------------------

  it('should iterate set', async () => {
    const database = resolveDatabase()
    const set = database.set('vectors')
    await set.add([0, 0, 0])
    await set.add([1, 0, 0])
    await set.add([2, 0, 0])
    const buffer: any[] = []
    for await (const value of set) {
      buffer.push(value)
    }
    Assert.deepEqual(buffer.length, 3)
  })

  // ---------------------------------------------------------
  // Collect
  // ---------------------------------------------------------

  it('should collect set', async () => {
    const database = resolveDatabase()
    const set = database.set('vectors')
    await set.add([0, 0, 0])
    await set.add([1, 0, 0])
    await set.add([2, 0, 0])
    const buffer = await set.collect()
    Assert.deepEqual(buffer.length, 3)
  })

  // ---------------------------------------------------------
  // Type Assertions
  // ---------------------------------------------------------

  it('should throw add invalid value', async () => {
    const database = resolveDatabase()
    const set = database.set('vectors')
    // @ts-ignore
    await Assert.throwsAsync(async () => await set.add([0, 0]))
  })
})
