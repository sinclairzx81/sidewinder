import IORedis, { Redis } from 'ioredis-mock'
import { Type, RedisDatabase } from '@sidewinder/redis'
import { Assert } from '../assert/index'
export function resolveRedis(): Redis {
  return new IORedis(`redis://${Assert.randomUUID()}`) as any
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
  return new RedisDatabase(Schema, resolveRedis())
}
