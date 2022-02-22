import { Assert } from '../../assert/index'
import { resolveDatabase } from '../resolve'

describe('redis/RedisArray', () => {
  // ---------------------------------------------------------
  // Push
  // ---------------------------------------------------------

  it('should push value', async () => {
    const database = resolveDatabase()
    const array = database.array('vectors')
    await array.push([0, 0, 0])
    const length = await array.length()
    Assert.deepEqual(length, 1)
  })

  it('should push multiple values', async () => {
    const database = resolveDatabase()
    const array = database.array('vectors')
    await array.push([0, 0, 0], [1, 1, 1])
    const length = await array.length()
    const value0 = await array.get(0)
    const value1 = await array.get(1)
    Assert.deepEqual(length, 2)
    Assert.deepEqual(value0, [0, 0, 0])
    Assert.deepEqual(value1, [1, 1, 1])
  })

  it('should push and get value', async () => {
    const database = resolveDatabase()
    const array = database.array('vectors')
    await array.push([0, 1, 2])
    const value = await array.get(0)
    const length = await array.length()
    Assert.deepEqual(value, [0, 1, 2])
    Assert.deepEqual(length, 1)
  })

  it('should push and pop value', async () => {
    const database = resolveDatabase()
    const array = database.array('vectors')
    await array.push([0, 1, 2])
    const value = await array.pop()
    const length = await array.length()
    Assert.deepEqual(value, [0, 1, 2])
    Assert.deepEqual(length, 0)
  })

  it('should push and shift value', async () => {
    const database = resolveDatabase()
    const array = database.array('vectors')
    await array.push([0, 1, 2])
    const value = await array.shift()
    const length = await array.length()
    Assert.deepEqual(value, [0, 1, 2])
    Assert.deepEqual(length, 0)
  })

  // ---------------------------------------------------------
  // Unshift
  // ---------------------------------------------------------

  it('should unshift value', async () => {
    const database = resolveDatabase()
    const array = database.array('vectors')
    await array.unshift([0, 0, 0])
    const length = await array.length()
    Assert.deepEqual(length, 1)
  })

  it('should unshift multiple values', async () => {
    const database = resolveDatabase()
    const array = database.array('vectors')
    await array.unshift([0, 0, 0], [1, 1, 1])
    const length = await array.length()
    const value0 = await array.get(0)
    const value1 = await array.get(1)
    Assert.deepEqual(length, 2)
    Assert.deepEqual(value0, [0, 0, 0])
    Assert.deepEqual(value1, [1, 1, 1])
  })

  it('should unshift and get value', async () => {
    const database = resolveDatabase()
    const array = database.array('vectors')
    await array.unshift([0, 1, 2])
    const value = await array.get(0)
    const length = await array.length()
    Assert.deepEqual(value, [0, 1, 2])
    Assert.deepEqual(length, 1)
  })

  it('should unshift and pop value', async () => {
    const database = resolveDatabase()
    const array = database.array('vectors')
    await array.unshift([0, 1, 2])
    const value = await array.pop()
    const length = await array.length()
    Assert.deepEqual(value, [0, 1, 2])
    Assert.deepEqual(length, 0)
  })

  // ---------------------------------------------------------
  // Shift
  // ---------------------------------------------------------

  it('should shift values', async () => {
    const database = resolveDatabase()
    const array = database.array('vectors')
    await array.push([0, 0, 0])
    await array.push([1, 1, 1])
    const value0 = await array.shift()
    const value1 = await array.shift()
    const value2 = await array.shift()
    Assert.deepEqual(value0, [0, 0, 0])
    Assert.deepEqual(value1, [1, 1, 1])
    Assert.deepEqual(value2, undefined)
  })

  // ---------------------------------------------------------
  // Pop
  // ---------------------------------------------------------

  it('should pop values', async () => {
    const database = resolveDatabase()
    const array = database.array('vectors')
    await array.push([0, 0, 0])
    await array.push([1, 1, 1])
    const value0 = await array.pop()
    const value1 = await array.pop()
    const value2 = await array.pop()
    Assert.deepEqual(value0, [1, 1, 1])
    Assert.deepEqual(value1, [0, 0, 0])
    Assert.deepEqual(value2, undefined)
  })

  // ---------------------------------------------------------
  // Set
  // ---------------------------------------------------------

  it('should set value at index', async () => {
    const database = resolveDatabase()
    const array = database.array('vectors')
    await array.push([0, 0, 0])
    await array.push([1, 1, 1])
    await array.set(1, [2, 2, 2])
    const value0 = await array.get(0)
    const value1 = await array.get(1)
    const length = await array.length()
    Assert.deepEqual(value0, [0, 0, 0])
    Assert.deepEqual(value1, [2, 2, 2])
    Assert.deepEqual(length, 2)
  })

  // ---------------------------------------------------------
  // Clear
  // ---------------------------------------------------------

  it('should clear values', async () => {
    const database = resolveDatabase()
    const array = database.array('vectors')
    await array.push([0, 0, 0])
    await array.push([1, 1, 1])
    await array.clear()
    const value0 = await array.get(0)
    const value1 = await array.get(1)
    const length = await array.length()
    Assert.deepEqual(value0, undefined)
    Assert.deepEqual(value1, undefined)
    Assert.deepEqual(length, 0)
  })

  // ---------------------------------------------------------
  // Iterate
  // ---------------------------------------------------------

  it('should iterate values in an array', async () => {
    const database = resolveDatabase()
    const array = database.array('vectors')
    await array.push([0, 0, 0])
    await array.push([1, 0, 0])
    await array.push([2, 0, 0])
    await array.push([3, 0, 0])
    const buffer: any[] = []
    for await (const value of array) {
      buffer.push(value)
    }
    Assert.deepEqual(buffer, [
      [0, 0, 0],
      [1, 0, 0],
      [2, 0, 0],
      [3, 0, 0],
    ])
  })

  // ---------------------------------------------------------
  // Collect
  // ---------------------------------------------------------

  it('should collect values in an array', async () => {
    const database = resolveDatabase()
    const array = database.array('vectors')
    await array.push([0, 0, 0])
    await array.push([1, 0, 0])
    await array.push([2, 0, 0])
    await array.push([3, 0, 0])
    const buffer = await array.collect()
    Assert.deepEqual(buffer, [
      [0, 0, 0],
      [1, 0, 0],
      [2, 0, 0],
      [3, 0, 0],
    ])
  })

  // ---------------------------------------------------------
  // Type Assertions
  // ---------------------------------------------------------

  it('should throw push on invalid value', async () => {
    const database = resolveDatabase()
    const array = database.array('vectors')
    // @ts-ignore
    await Assert.throwsAsync(async () => await array.push([0, 0]))
  })

  it('should throw unshift on invalid value', async () => {
    const database = resolveDatabase()
    const array = database.array('vectors')
    // @ts-ignore
    await Assert.throwsAsync(async () => await array.unshift([0, 0]))
  })

  it('should throw set on invalid value', async () => {
    const database = resolveDatabase()
    const array = database.array('vectors')
    // @ts-ignore
    await Assert.throwsAsync(async () => await array.set(0, [0, 0]))
  })
})
