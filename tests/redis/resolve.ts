import { Redis } from 'ioredis'
import { RedisClient } from 'redis-mock'

export function resolveRedis(): Redis {
  return new RedisClient({}) as any as Redis
}
