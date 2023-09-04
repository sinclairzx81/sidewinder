/*--------------------------------------------------------------------------

@sidewinder/redis

The MIT License (MIT)

Copyright (c) 2022 Haydn Paterson (sinclair) <haydn.developer@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---------------------------------------------------------------------------*/

import IORedis, { RedisOptions, Redis as RedisInstance, Cluster as ClusterInstance } from 'ioredis'
import { Timeout } from '@sidewinder/async'
import { SetOptions, SortedSetRangeOptions, Store } from './store'

export { RedisOptions } from 'ioredis'

export class RedisStoreConnectError extends Error {
  constructor(message: string) {
    super(`RedisConnect: ${message}`)
  }
}

/** A RedisStore that is backed by a Redis instance. */
export class RedisStore implements Store {
  constructor(public readonly redis: RedisInstance | ClusterInstance) {}
  public async del(key: string): Promise<void> {
    await this.redis.del(key)
  }
  public async llen(key: string): Promise<number> {
    return await this.redis.llen(key)
  }
  public async lset(key: string, index: number, value: string): Promise<void> {
    await this.redis.lset(key, index, value)
  }
  public async lindex(key: string, index: number): Promise<string | null> {
    return await this.redis.lindex(key, index)
  }
  public async rpush(key: string, value: string): Promise<void> {
    await this.redis.rpush(key, value)
  }
  public async lpush(key: string, value: string): Promise<void> {
    await this.redis.lpush(key, value)
  }
  public async rpop(key: string): Promise<string | null> {
    return await this.redis.rpop(key)
  }
  public async lpop(key: string): Promise<string | null> {
    return await this.redis.lpop(key)
  }
  public async lrange(key: string, start: number, end: number): Promise<string[]> {
    return await this.redis.lrange(key, start, end)
  }
  public async get(key: string): Promise<string | null> {
    return await this.redis.get(key)
  }
  public async keys(pattern: string): Promise<string[]> {
    return await this.redis.keys(pattern)
  }
  public async exists(key: string): Promise<number> {
    return await this.redis.exists(key)
  }
  public async expire(key: string, seconds: number): Promise<void> {
    await this.redis.expire(key, seconds)
  }
  public async set(key: string, value: string, options: SetOptions = {}): Promise<boolean> {
    if (options.conditionalSet === 'exists') {
      const result = await this.redis.set(key, value, 'XX')
      return result === 'OK'
    } else if (options.conditionalSet === 'not-exists') {
      const result = await this.redis.set(key, value, 'NX')
      return result === 'OK'
    } else {
      const result = await this.redis.set(key, value)
      return result === 'OK'
    }
  }
  public async zadd(key: string, members: [score: number, member: string][]): Promise<number> {
    return await this.redis.zadd(key, ...members.flat())
  }
  public async zincrby(key: string, increment: number, member: string): Promise<number> {
    const response = await this.redis.zincrby(key, increment, member)
    return parseFloat(response)
  }
  public async zrange(key: string, start: number, stop: number, options: SortedSetRangeOptions = {}): Promise<string[]> {
    if (options.reverseOrder) {
      if (options.includeScores) {
        return await this.redis.zrange(key, start, stop, 'REV', 'WITHSCORES')
      } else {
        return await this.redis.zrange(key, start, stop, 'REV')
      }
    } else {
      if (options.includeScores) {
        return await this.redis.zrange(key, start, stop, 'WITHSCORES')
      } else {
        return await this.redis.zrange(key, start, stop)
      }
    }
  }
  public async zcard(key: string): Promise<number> {
    return await this.redis.zcard(key)
  }
  public disconnect(): void {
    this.redis.disconnect(false)
  }
  // --------------------------------------------------------
  // Factory
  // --------------------------------------------------------
  /** Connects to Redis with the given parameters */
  public static Create(port?: number, host?: string, options?: RedisOptions): Promise<Store>
  /** Connects to Redis with the given parameters */
  public static Create(host?: string, options?: RedisOptions): Promise<Store>
  /** Connects to Redis with the given parameters */
  public static Create(options: RedisOptions): Promise<Store>
  public static async Create(...args: unknown[]): Promise<Store> {
    // @ts-ignore (we assume the overloaded arguments have appropriately narrowed)
    const redis = new IORedis(...args)
    await Timeout.run(async () => await redis.echo('echo'), 8000, new RedisStoreConnectError('Connection to Redis timed out'))
    return new RedisStore(redis)
  }
}
