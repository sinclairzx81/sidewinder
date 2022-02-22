import { Assert } from '../../assert/index'
import { resolveDatabase } from '../resolve'

describe('redis/RedisMap', () => {

  // ---------------------------------------------------------
  // Set
  // ---------------------------------------------------------

  it('should set values', async () => {
    const database = resolveDatabase()
    const map = database.map('vectors')
    await map.set('A', [0, 0, 0])
    await map.set('B', [1, 0, 0])
    await map.set('C', [2, 0, 0])
    const size = await map.size()
    Assert.deepEqual(size, 3)
  })

  it('should set overlap values', async () => {
    const database = resolveDatabase()
    const map = database.map('vectors')
    await map.set('A', [0, 0, 0])
    await map.set('A', [1, 0, 0])
    await map.set('A', [2, 0, 0])
    const size = await map.size()
    Assert.deepEqual(size, 1)
  })

  it('should set and get values', async () => {
    const database = resolveDatabase()
    const map = database.map('vectors')
    await map.set('A', [0, 0, 0])
    await map.set('B', [1, 0, 0])
    await map.set('C', [2, 0, 0])
    const value0 = await map.get('A')
    const value1 = await map.get('B')
    const value2 = await map.get('C')
    Assert.deepEqual(value0, [0, 0, 0])
    Assert.deepEqual(value1, [1, 0, 0])
    Assert.deepEqual(value2, [2, 0, 0])
  })

  it('should set and delete values', async () => {
    const database = resolveDatabase()
    const map = database.map('vectors')
    await map.set('A', [0, 0, 0])
    await map.set('B', [1, 0, 0])
    await map.set('C', [2, 0, 0])
    await map.delete('B')
    
    const value0 = await map.get('A')
    const value1 = await map.get('B')
    const value2 = await map.get('C')
    const size = await map.size()
    Assert.deepEqual(size, 2)
    Assert.deepEqual(value0, [0, 0, 0])
    Assert.deepEqual(value1, undefined)
    Assert.deepEqual(value2, [2, 0, 0])
  })

  it('should set and clear values', async () => {
    const database = resolveDatabase()
    const map = database.map('vectors')
    await map.set('A', [0, 0, 0])
    await map.set('B', [1, 0, 0])
    await map.set('C', [2, 0, 0])
    await map.clear()
    const value0 = await map.get('A')
    const value1 = await map.get('B')
    const value2 = await map.get('C')
    const size = await map.size()
    Assert.deepEqual(size, 0)
    Assert.deepEqual(value0, undefined)
    Assert.deepEqual(value1, undefined)
    Assert.deepEqual(value2, undefined)
  })

  // ---------------------------------------------------------
  // Type Assertions
  // ---------------------------------------------------------

  it('should throw push on invalid value', async () => {
    const database = resolveDatabase()
    const array = database.array('vectors')
    // @ts-ignore
    Assert.throwsAsync(async () => await array.push([0, 0]))
  })

  it('should throw unshift on invalid value', async () => {
    const database = resolveDatabase()
    const array = database.array('vectors')
    // @ts-ignore
    Assert.throwsAsync(async () => await array.unshift([0, 0]))
  })
})
