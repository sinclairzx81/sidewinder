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

import { Redis } from 'ioredis'
import { SetOptions, SortedSetRangeOptions, Store } from './store'
import IORedis from 'ioredis-mock'

export class MemoryStoreError extends Error {
  constructor(message: string) {
    super(`MemoryStore: ${message}`)
  }
}

/** A RedisStore that is backed JavaScript memory. */
export class MemoryStore implements Store {
  readonly #store: Redis // ioredis-mock doesn't provide it's own type, just implements the ioredis one
  constructor() {
    this.#store = new IORedis()
    this.#store.flushall()
  }
  public async del(key: string): Promise<void> {
    await this.#store.del(key)
  }
  public async llen(key: string): Promise<number> {
    return await this.#store.llen(key)
  }
  public async lset(key: string, index: number, value: string): Promise<void> {
    await this.#store.lset(key, index, value)
  }
  public async lindex(key: string, index: number): Promise<string | null> {
    return await this.#store.lindex(key, index)
  }
  public async rpush(key: string, value: string): Promise<void> {
    await this.#store.rpush(key, value)
  }
  public async lpush(key: string, value: string): Promise<void> {
    await this.#store.lpush(key, value)
  }
  public async rpop(key: string): Promise<string | null> {
    return await this.#store.rpop(key)
  }
  public async lpop(key: string): Promise<string | null> {
    return await this.#store.lpop(key)
  }
  public async lrange(key: string, start: number, end: number): Promise<string[]> {
    return await this.#store.lrange(key, start, end)
  }
  public async get(key: string): Promise<string | null> {
    return await this.#store.get(key)
  }
  public async keys(pattern: string): Promise<string[]> {
    return await this.#store.keys(pattern)
  }
  public async exists(key: string): Promise<number> {
    return await this.#store.exists(key)
  }
  public async expire(key: string, seconds: number): Promise<void> {
    await this.#store.expire(key, seconds)
  }
  public async set(key: string, value: string, options: SetOptions = {}): Promise<boolean> {
    if (options.conditionalSet === 'exists') {
      const result = await this.#store.set(key, value, 'XX')
      return result === 'OK'
    } else if (options.conditionalSet === 'not-exists') {
      const result = await this.#store.set(key, value, 'NX')
      return result === 'OK'
    } else {
      const result = await this.#store.set(key, value)
      return result === 'OK'
    }
  }

  public async zadd(key: string, members: [score: number, member: string][]): Promise<number> {
    return await this.#store.zadd(key, ...members.flat())
  }

  public async zincrby(key: string, increment: number, member: string): Promise<number> {
    const response = await this.#store.zincrby(key, increment, member)
    return parseFloat(response)
  }

  public async zrange(key: string, start: number, stop: number, options: SortedSetRangeOptions = {}): Promise<string[]> {
    if (options.reverseOrder) {
      if (options.includeScores) {
        return await this.#store.zrange(key, start, stop, 'REV', 'WITHSCORES')
      } else {
        return await this.#store.zrange(key, start, stop, 'REV')
      }
    } else {
      if (options.includeScores) {
        return await this.#store.zrange(key, start, stop, 'WITHSCORES')
      } else {
        return await this.#store.zrange(key, start, stop)
      }
    }
  }

  public async zcard(key: string): Promise<number> {
    return await this.#store.zcard(key)
  }

  public disconnect(): void {
    this.#store.disconnect()
  }

  // --------------------------------------------------------
  // Factory
  // --------------------------------------------------------

  /** Creates a singleton instance of a memory store */
  public static Singleton(): Store {
    if (singleton.length === 0) singleton.push(new MemoryStore())
    return singleton[0]
  }

  /** Creates a new in memory redis store */
  public static Create(): Store {
    return new MemoryStore()
  }
}

// external: static construction on some javascript build tooling may fail
const singleton: MemoryStore[] = []
