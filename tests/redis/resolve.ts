import IORedis from 'ioredis-mock'
import { Type, RedisDatabase, Store, RedisStore, MemoryStore } from '@sidewinder/redis'
import { Assert } from '../assert/index'

export function resolveMockStore(): Store {
  return new IORedis(`redis://${Assert.randomUUID()}`) as any
}

export function resolveMemoryStore(): Store {
  return MemoryStore.Create()
}

export function resolveDatabase() {
  const Vector = Type.Tuple([Type.Number(), Type.Number(), Type.Number()])
  const Schema = Type.Database({
    arrays: {
      vectors: Vector,
    },
    maps: {
      vectors: Vector,
    },
    sets: {
      vectors: Vector,
    },
  })
  return new RedisDatabase(Schema, resolveMemoryStore())
}
