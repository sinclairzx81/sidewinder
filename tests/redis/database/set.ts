import { Assert } from '../../assert/index'
import { resolveDatabase } from '../resolve'

describe('redis/RedisSet', () => {
  // ---------------------------------------------------------
  // add
  // ---------------------------------------------------------

  it('Should add values', async () => {
    const database = resolveDatabase()
    const set = database.set('vectors')
    await set.add([0, 0, 0])
    await set.add([1, 0, 0])
    await set.add([2, 0, 0])
    const size = await set.size()
    Assert.deepEqual(size, 3)
  })

  it('Should add values with overlap', async () => {
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

  it('Should get values with overlap', async () => {
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

  it('Should return correct has values', async () => {
    const database = resolveDatabase()
    const set = database.set('vectors')
    await set.add([0, 0, 0])
    const value0 = await set.has([0, 0, 0])
    const value1 = await set.has([0, 0, 1])
    Assert.deepEqual(value0, true)
    Assert.deepEqual(value1, false)
  })

  it('Should clear set', async () => {
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

  it('Should iterate set', async () => {
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

  it('Should collect set', async () => {
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

  it('Should throw add invalid value', async () => {
    const database = resolveDatabase()
    const set = database.set('vectors')
    // @ts-ignore
    await Assert.throwsAsync(async () => await set.add([0, 0]))
  })
})
