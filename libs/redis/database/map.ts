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
import { Validator } from '@sidewinder/validator'
import { RedisEncoder } from '../encoder'
import { Static, TSchema } from '../type'

/** A RedisMap is analogous to a JavaScript Map. It provides asynchronous set, get, clear and key value enumeration. */
export class RedisMap<Schema extends TSchema> {
  private readonly validator: Validator<TSchema>
  private readonly encoder: RedisEncoder

  constructor(private readonly schema: Schema, private readonly redis: Redis, private readonly keyspace: string) {
    this.validator = new Validator(this.schema)
    this.encoder = new RedisEncoder(this.schema)
  }

  /** Async iterator for this Map */
  public async *[Symbol.asyncIterator]() {
    for (const key of await this.redis.keys(this.encodeKey('*'))) {
      const value = await this.redis.get(key)
      if (value === null) continue
      yield [this.decodeKey(key), this.encoder.decode<Static<Schema>>(value)]
    }
  }

  /** Clears all this Map */
  public async clear() {
    for (const key of await this.redis.keys(this.encodeAllKeys())) {
      await this.redis.del(key)
    }
  }

  /** Returns true if this key exists */
  public async has(key: string): Promise<boolean> {
    const result = await this.redis.exists(this.encodeKey(key))
    return result > 0
  }

  /** Sets the value for the given key */
  public async set(key: string, value: Static<Schema>) {
    this.validator.assert(value)
    return await this.redis.set(this.encodeKey(key), this.encoder.encode(value))
  }

  /** Gets the value for the given key */
  public async get(key: string): Promise<Static<Schema> | undefined> {
    const value = await this.redis.get(this.encodeKey(key))
    if (value === null) return undefined
    return this.encoder.decode(value)
  }

  /** Deletes the given key */
  public async delete(key: string) {
    return await this.redis.del(this.encodeKey(key))
  }

  /** Returns the number of entries in this Map */
  public async size(): Promise<number> {
    const keys = await this.redis.keys(this.encodeKey('*'))
    return keys.length
  }

  /** Returns an async iterator for all entries in this Map */
  public async *entries(): AsyncGenerator<[string, Static<Schema>]> {
    for (const key of await this.redis.keys(this.encodeKey('*'))) {
      const value = await this.redis.get(key)
      if (value === null) continue
      yield [this.decodeKey(key), this.encoder.decode<Static<Schema>>(value)]
    }
  }

  /** Returns an async iterator to the values in this Map */
  public async *values(): AsyncIterable<Static<Schema>> {
    for (const key of await this.redis.keys(this.encodeAllKeys())) {
      const value = await this.redis.get(key)
      if (value === null) continue
      yield this.encoder.decode(value)
    }
  }

  /** Returns an async iterator to the keys in this Map */
  public async *keys(): AsyncIterable<string> {
    for (const key of await this.redis.keys(this.encodeAllKeys())) {
      yield this.decodeKey(key)
    }
  }

  /** Returns all entries in this Map */
  public async collect(): Promise<[string, Static<Schema>][]> {
    const values: [string, Static<Schema>][] = []
    for await (const value of this.entries()) {
      values.push(value)
    }
    return values
  }
  // ------------------------------------------------------------
  // Key Encoding
  // ------------------------------------------------------------

  private encodeAllKeys() {
    return `sw::map:${this.keyspace}:*`
  }

  private encodeKey(key: string) {
    return `sw::map:${this.keyspace}:${key}`
  }

  private decodeKey(key: string) {
    return key.replace(`sw::map:${this.keyspace}:`, '')
  }
}
