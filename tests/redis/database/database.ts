import { RedisDatabase, RedisArray, RedisMap, RedisSet } from '@sidewinder/redis'
import { resolveDatabase } from '../resolve'
import { Assert } from '../../assert/index'

describe('redis/RedisDatabase', () => {
  it('Should return known array', async () => {
    const database = await resolveDatabase()
    const array = database.array('vectors')
    Assert.isInstanceOf(array, RedisArray)
  })

  it('Should return known set', async () => {
    const database = await resolveDatabase()
    const set = database.set('vectors')
    Assert.isInstanceOf(set, RedisSet)
  })

  it('Should return known map', async () => {
    const database = await resolveDatabase()
    const map = database.map('vectors')
    Assert.isInstanceOf(map, RedisMap)
  })

  // -------------------------------------------------
  // Asserts
  // -------------------------------------------------

  it('Should throw on unknown array', async () => {
    const database = await resolveDatabase()
    // @ts-ignore
    Assert.throws(() => database.array('unknown'))
  })

  it('Should throw on unknown set', async () => {
    const database = await resolveDatabase()
    // @ts-ignore
    Assert.throws(() => database.set('unknown'))
  })

  it('Should throw on unknown map', async () => {
    const database = await resolveDatabase()
    // @ts-ignore
    Assert.throws(() => database.map('unknown'))
  })
})
