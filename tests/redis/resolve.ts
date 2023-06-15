import IORedis from 'ioredis-mock'
import { Type, RedisDatabase, Store, RedisStore, MemoryStore } from '@sidewinder/redis'
import { Assert } from '../assert/index'

export async function resolveMockStore(): Promise<Store> {
  const redis = new IORedis(`redis://${Assert.randomUUID}`)
  await redis.flushall()
  return new RedisStore(redis)
  // return new IORedis(`redis://${Assert.randomUUID()}`) as any
}

export function resolveMemoryStore(): Store {
  return MemoryStore.Create()
}

export async function resolveDatabase() {
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
  return new RedisDatabase(Schema, await resolveMockStore())
}
