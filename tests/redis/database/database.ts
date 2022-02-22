import { RedisDatabase, RedisArray, RedisMap, RedisSet } from '@sidewinder/redis'
import { resolveDatabase } from '../resolve'
import { Assert } from '../../assert/index'

describe('redis/RedisDatabase', () => {
  it('should return known array', () => {
    const database = resolveDatabase()
    const array = database.array('vectors')
    Assert.isInstanceOf(array, RedisArray)
  })

  it('should return known set', () => {
    const database = resolveDatabase()
    const set = database.set('vectors')
    Assert.isInstanceOf(set, RedisSet)
  })

  it('should return known map', () => {
    const database = resolveDatabase()
    const map = database.map('vectors')
    Assert.isInstanceOf(map, RedisMap)
  })

  // -------------------------------------------------
  // Asserts
  // -------------------------------------------------

  it('should throw on unknown array', () => {
    const database = resolveDatabase()
    // @ts-ignore
    Assert.throws(() => database.array('unknown'))
    
  })

  it('should throw on unknown set', () => {
    const database = resolveDatabase()
    // @ts-ignore
    Assert.throws(() => database.set('unknown'))
    
  })

  it('should throw on unknown map', () => {
    const database = resolveDatabase()
    // @ts-ignore
    Assert.throws(() => database.map('unknown'))
  })
})
