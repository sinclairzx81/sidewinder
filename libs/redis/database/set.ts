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
import { Static, TSchema } from '@sidewinder/type'
import { Value } from '@sidewinder/value'
import { RedisEncoder, RedisDecoder } from '../codecs/index'

/**
 * A RedisSet is analogous to a JavaScript Set. It provides asynchronous add, delete and has methods
 * which are executed in a unqiue keyspace. The RedisSet supports arbituary object hashing allowing
 * JavaScript objects and arrays to be safely added to sets.
 */
export class RedisSet<T extends TSchema> {
  readonly #encoder: RedisEncoder<T>
  readonly #decoder: RedisDecoder<T>

  constructor(private readonly schema: T, private readonly redis: Redis, private readonly keyspace: string) {
    this.#encoder = new RedisEncoder(this.schema)
    this.#decoder = new RedisDecoder(this.schema)
  }

  /** Async iterator for this Set */
  public async *[Symbol.asyncIterator]() {
    yield* this.values()
  }

  /** Clears all values in the Set */
  public async clear() {
    for (const key of await this.redis.keys(this.encodeAllKeys())) {
      await this.redis.del(key)
    }
  }

  /** Returns true if this value is in the Set */
  public async has(value: Static<T>): Promise<boolean> {
    return (await this.redis.exists(this.encodeKey(value))) > 0
  }

  /** Adds the given value to the Set */
  public async add(value: Static<T>) {
    return this.redis.set(this.encodeKey(value), this.#encoder.encode(value))
  }

  /** Deletes the given value from the Set */
  public async delete(value: Static<T>) {
    return this.redis.del(this.encodeKey(value))
  }

  /** Returns the number of entries in this Set */
  public async size(): Promise<number> {
    const keys = await this.redis.keys(this.encodeAllKeys())
    return keys.length
  }

  /** Returns an async iterator each key in this Set  */
  public async *keys(): AsyncIterable<string> {
    for (const key of await this.redis.keys(this.encodeAllKeys())) {
      yield this.decodeKey(key)
    }
  }

  /** Returns an async iterator for each value in this Set */
  public async *values(): AsyncIterable<Static<T>> {
    for (const key of await this.redis.keys(this.encodeAllKeys())) {
      const value = await this.redis.get(key)
      if (value === null) continue
      yield this.#decoder.decode(value)
    }
  }

  /** Returns all values in this Set */
  public async collect(): Promise<Static<T>[]> {
    const values: Static<T>[] = []
    for await (const value of this.values()) {
      values.push(value)
    }
    return values
  }

  // ------------------------------------------------------------
  // Key Encoding
  // ------------------------------------------------------------

  private encodeAllKeys() {
    return `sw::set:${this.keyspace}:*`
  }

  private encodeKey(value: Static<T>) {
    const hash = Value.Hash(value).toString()
    return `sw::set:${this.keyspace}:${hash}`
  }

  private decodeKey(key: string) {
    return key.replace(`sw::set:${this.keyspace}:`, '')
  }
}
