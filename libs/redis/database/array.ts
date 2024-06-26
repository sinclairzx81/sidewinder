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
import { Store } from '../store/index'

/** A RedisArray is analogous to a JavaScript Array. It provides asynchronous push, shift, pop, unshift and indexing values in a remote Redis list. */
export class RedisArray<T extends TSchema> {
  readonly #encoder: RedisEncoder<T>
  readonly #decoder: RedisDecoder<T>

  constructor(private readonly schema: T, private readonly store: Store, private readonly keyspace: string) {
    this.#encoder = new RedisEncoder(this.schema)
    this.#decoder = new RedisDecoder(this.schema)
  }

  /** Async iterator for this Array */
  public async *[Symbol.asyncIterator]() {
    const length = await this.store.llen(this.resolveKey())
    const slice = 32
    for (let offset = 0; offset < length; offset += slice) {
      for (const value of await this.store.lrange(this.resolveKey(), offset, offset + slice)) {
        yield this.#decoder.decode(value)
      }
    }
  }

  /** Clears this Array */
  public async clear() {
    await this.store.del(this.resolveKey())
  }

  /** Returns the length of this Array */
  public async length(): Promise<number> {
    return await this.store.llen(this.resolveKey())
  }

  /** Gets the value at the given index. */
  public async get(index: number): Promise<Static<T> | undefined> {
    const value = await this.store.lindex(this.resolveKey(), index)
    if (value === null) return undefined
    return this.#decoder.decode(value)
  }

  /** Sets the value at the given index */
  public async set(index: number, value: Static<T>): Promise<void> {
    this.store.lset(this.resolveKey(), index, this.#encoder.encode(value))
  }

  /** Pushes a value to the end of this Array */
  public async push(...values: Static<T>[]) {
    const mapped = values.map((value) => this.#encoder.encode(value))
    for (const value of mapped) {
      await this.store.rpush(this.resolveKey(), value)
    }
  }

  /** Pushes a value to the start of this Array */
  public async unshift(...values: Static<T>[]): Promise<void> {
    const mapped = values.map((value) => this.#encoder.encode(value))
    for (const value of mapped.reverse()) {
      await this.store.lpush(this.resolveKey(), value)
    }
  }

  /** Pops a value from the end of this Array or undefined if empty */
  public async pop(): Promise<Static<T> | undefined> {
    const value = await this.store.rpop(this.resolveKey())
    if (value === null) return undefined
    return this.#decoder.decode(value)
  }

  /** Shifts a value from the start of this Array or undefined if empty */
  public async shift(): Promise<Static<T> | undefined> {
    const value = await this.store.lpop(this.resolveKey())
    if (value === null) return undefined
    return this.#decoder.decode(value)
  }

  /** Returns a array slice */
  public async slice(start: number, end: number) {
    return await this.store.lrange(this.resolveKey(), start, end)
  }

  /** Returns all values in this Array */
  public async values(): Promise<Static<T>[]> {
    const buffer: Static<T>[] = []
    const length = await this.store.llen(this.resolveKey())
    const slice = 32
    for (let offset = 0; offset < length; offset += slice) {
      for (const value of await this.store.lrange(this.resolveKey(), offset, offset + slice)) {
        buffer.push(this.#decoder.decode(value))
      }
    }
    return buffer
  }

  // ------------------------------------------------------------
  // Key Encoding
  // ------------------------------------------------------------

  private resolveKey() {
    return `sw::array:${this.keyspace}`
  }
}
