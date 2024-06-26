/*--------------------------------------------------------------------------

@sidewinder/redis

The MIT License (MIT)

Copyright (c) 2022-2024 Haydn Paterson (sinclair) <haydn.developer@gmail.com>

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

import { Static, TSchema } from '@sidewinder/type'
import { RedisEncoder, RedisDecoder } from '../codecs/index'
import { SetOptions, Store } from '../store/index'

/** A RedisMap is analogous to a JavaScript Map. It provides asynchronous set, get, clear and key value enumeration.
 *  There is one additional feature for RedisMap, where the set operation can be conditional based on whether the key
 *  already exists in the map or not.
 */
export class RedisMap<T extends TSchema> {
  readonly #encoder: RedisEncoder<T>
  readonly #decoder: RedisDecoder<T>

  constructor(private readonly schema: T, private readonly store: Store, private readonly keyspace: string) {
    this.#encoder = new RedisEncoder(this.schema)
    this.#decoder = new RedisDecoder(this.schema)
  }

  /** Async iterator for this Map */
  public async *[Symbol.asyncIterator]() {
    for (const key of await this.store.keys(this.encodeKey('*'))) {
      const value = await this.store.get(key)
      if (value === null) continue
      yield [this.decodeKey(key), this.#decoder.decode(value)]
    }
  }

  /** Clears this Map */
  public async clear() {
    for (const key of await this.store.keys(this.encodeAllKeys())) {
      await this.store.del(key)
    }
  }

  /** Returns true if this key exists */
  public async has(key: string): Promise<boolean> {
    const result = await this.store.exists(this.encodeKey(key))
    return result > 0
  }

  /**
   * Sets the value for the given key
   * @param key The key to write to
   * @param value The value to set
   * @param options Optional set conditions
   * @returns If the operation successfully updated data
   */
  public async set(key: string, value: Static<T>, options?: SetOptions) {
    return await this.store.set(this.encodeKey(key), this.#encoder.encode(value), options)
  }

  /** Gets the value for the given key */
  public async get(key: string): Promise<Static<T> | undefined> {
    const value = await this.store.get(this.encodeKey(key))
    if (value === null) return undefined
    return this.#decoder.decode(value)
  }

  /** Sets a key to expire after the given seconds have elapsed */
  public async expire(key: string, seconds: number): Promise<void> {
    await this.store.expire(this.encodeKey(key), seconds)
  }

  /** Deletes the given key */
  public async delete(key: string) {
    return await this.store.del(this.encodeKey(key))
  }

  /** Returns the number of entries in this Map */
  public async size(): Promise<number> {
    const keys = await this.store.keys(this.encodeAllKeys())
    return keys.length
  }

  /** Returns an array to all entries in this Map */
  public async entries(): Promise<[string, Static<T>][]> {
    const buffer: [string, Static<T>][] = []
    for (const key of await this.store.keys(this.encodeKey('*'))) {
      const value = await this.store.get(key)
      if (value === null) continue
      buffer.push([this.decodeKey(key), this.#decoder.decode(value)])
    }
    return buffer
  }

  /** Returns an array to all values in this Map */
  public async values(): Promise<Static<T>[]> {
    const buffer: Static<T>[] = []
    for (const key of await this.store.keys(this.encodeAllKeys())) {
      const value = await this.store.get(key)
      if (value === null) continue
      buffer.push(this.#decoder.decode(value))
    }
    return buffer
  }

  /** Returns an array to all keys in this map */
  public async keys(): Promise<string[]> {
    const buffer: string[] = []
    for (const key of await this.store.keys(this.encodeAllKeys())) {
      buffer.push(this.decodeKey(key))
    }
    return buffer
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
