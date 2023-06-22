import IORedis from 'ioredis-mock'
import Redis from 'ioredis'
import { Type, RedisDatabase, Store, RedisStore, MemoryStore } from '@sidewinder/redis'
import { Assert } from '../assert/index'

export async function resolveMockStore(): Promise<Store> {
  const redis = new IORedis(`redis://${Assert.randomUUID}`)
  await redis.flushall()
  return new RedisStore(redis)
}

export async function resolveLocalRedis(): Promise<Store> {
  const redis = new Redis()
  await redis.flushall()
  return new RedisStore(redis)
}

export function resolveMemoryStore(): Store {
  return MemoryStore.Create()
}

export async function resolveDatabase() {
  const Vector = Type.Tuple([Type.Number(), Type.Number(), Type.Number()])
  const User = Type.Object({
    name: Type.String(),
    age: Type.Number()
  })
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
    sortedsets: {
      scores: User
    }
  })
  return new RedisDatabase(Schema, await resolveMockStore())
}
