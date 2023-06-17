import { Assert } from '../../assert/index'
import { resolveDatabase } from '../resolve'

describe('redis/RedisMap', () => {
  // ---------------------------------------------------------
  // Set
  // ---------------------------------------------------------

  it('Should set values', async () => {
    const database = await resolveDatabase()
    const map = database.map('vectors')
    await map.set('A', [0, 0, 0])
    await map.set('B', [1, 0, 0])
    await map.set('C', [2, 0, 0])
    const size = await map.size()
    Assert.deepEqual(size, 3)
  })

  it('Should set overlap values', async () => {
    const database = await resolveDatabase()
    const map = database.map('vectors')
    await map.set('A', [0, 0, 0])
    await map.set('A', [1, 0, 0])
    await map.set('A', [2, 0, 0])
    const size = await map.size()
    Assert.deepEqual(size, 1)
  })

  it('Should add new values', async () => {
    const database = await resolveDatabase()
    const map = database.map('vectors')
    await map.set('A', [0, 0, 0], {conditionalSet: 'not-exists'})
    await map.set('B', [1, 0, 0], {conditionalSet: 'not-exists'})
    await map.set('C', [2, 0, 0], {conditionalSet: 'not-exists'})
    const size = await map.size()
    Assert.deepEqual(size, 3)
  })

  it('Should not override when adding', async () => {
    const database = await resolveDatabase()
    const map = database.map('vectors')
    await map.set('A', [0, 0, 0], {conditionalSet: 'not-exists'})
    const result = await map.set('A', [1, 0, 0], {conditionalSet: 'not-exists' })
    Assert.deepEqual(result, false)
    const a = await map.get('A')
    Assert.deepEqual(a, [0,0,0])
  })

  it('Should update existing value', async () => {
    const database = await resolveDatabase()
    const map = database.map('vectors')
    await map.set('A', [0, 0, 0])
    await map.set('A', [1, 0, 0], {conditionalSet: 'exists'})
    const a = await map.get('A')
    Assert.deepEqual(a, [1,0,0])
  })

  it('Should not update non-existent value', async () => {
    const database = await resolveDatabase()
    const map = database.map('vectors')
    const result = await map.set('A', [1, 0, 0], { conditionalSet: 'exists' })
    Assert.deepEqual(result, false)
    const size = await map.size()
    Assert.deepEqual(size, 0)
  })

  it('Should set and get values', async () => {
    const database = await resolveDatabase()
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

  it('Should set and delete values', async () => {
    const database = await resolveDatabase()
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

  it('Should set and clear values', async () => {
    const database = await resolveDatabase()
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

  it('Should return correct has value', async () => {
    const database = await resolveDatabase()
    const map = database.map('vectors')
    await map.set('A', [0, 0, 0])
    const value0 = await map.has('A')
    const value1 = await map.has('B')
    Assert.deepEqual(value0, true)
    Assert.deepEqual(value1, false)
  })

  // ---------------------------------------------------------
  // Type Assertions
  // ---------------------------------------------------------

  it('Should throw set invalid value', async () => {
    const database = await resolveDatabase()
    const map = database.array('vectors')
    // @ts-ignore
    await Assert.throwsAsync(async () => await map.set('A', [0, 0]))
  })
})
