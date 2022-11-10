import { RedisDatabase, RedisArray, RedisMap, RedisSet } from '@sidewinder/redis'
import { resolveDatabase } from '../resolve'
import { Assert } from '../../assert/index'

describe('redis/RedisDatabase', () => {
  it('Should return known array', () => {
    const database = resolveDatabase()
    const array = database.array('vectors')
    Assert.isInstanceOf(array, RedisArray)
  })

  it('Should return known set', () => {
    const database = resolveDatabase()
    const set = database.set('vectors')
    Assert.isInstanceOf(set, RedisSet)
  })

  it('Should return known map', () => {
    const database = resolveDatabase()
    const map = database.map('vectors')
    Assert.isInstanceOf(map, RedisMap)
  })

  // -------------------------------------------------
  // Asserts
  // -------------------------------------------------

  it('Should throw on unknown array', () => {
    const database = resolveDatabase()
    // @ts-ignore
    Assert.throws(() => database.array('unknown'))
  })

  it('Should throw on unknown set', () => {
    const database = resolveDatabase()
    // @ts-ignore
    Assert.throws(() => database.set('unknown'))
  })

  it('Should throw on unknown map', () => {
    const database = resolveDatabase()
    // @ts-ignore
    Assert.throws(() => database.map('unknown'))
  })
})
