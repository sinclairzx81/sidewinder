/*--------------------------------------------------------------------------

@sidewinder/redis

The MIT License (MIT)

Copyright (c) 2023 Jacques Foottit (waikikamoukow) <waikikamoukow@gmail.com>

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

/**
 * A RedisSet is analogous to a JavaScript Set. It provides asynchronous add, delete and has methods
 * which are executed in a unqiue keyspace. The RedisSet supports arbituary object hashing allowing
 * JavaScript objects and arrays to be safely added to sets.
 */
export class RedisSortedSet<T extends TSchema> {
  readonly #encoder: RedisEncoder<T>
  readonly #decoder: RedisDecoder<T>
  readonly #key: string

  constructor(private readonly schema: T, private readonly store: Store, private readonly keyspace: string) {
    this.#encoder = new RedisEncoder(this.schema)
    this.#decoder = new RedisDecoder(this.schema)
    this.#key = `sw::sortedset:${keyspace}`
  }

  public async add(members: [score: number, member: Static<T>][]) {
    return await this.store.zadd(this.#key, members.map(([score, member]) => [score, this.#encoder.encode(member)]))
  }

  public async count() {
    return await this.store.zcard(this.#key)
  }

  public async getRangeWithScores(startIndex: number, endIndex: number, reverseOrder?: boolean): Promise<[number, Static<T>][]> {
    const results = await this.store.zrange(this.#key, startIndex, endIndex, { reverseOrder, includeScores: true })
    if (results.length % 2 !== 0) {
      // something went wrong, including scores should always result in an even number of entries
      throw new Error('Invalid response from Redis')
    }
    const formattedResults: [number, Static<T>][] = []
    for (let i = 0; i < results.length; i += 2) {
      const formattedResult: [number, Static<T>] = [parseFloat(results[i + 1]), this.#decoder.decode(results[i])]
      formattedResults.push(formattedResult)
    }
    return formattedResults
  }

  public async getRange(startIndex: number, endIndex: number, reverseOrder?: boolean): Promise<Static<T>[]> {
    const results = await this.store.zrange(this.#key, startIndex, endIndex, {reverseOrder})
    return results.map(result => this.#decoder.decode(result))
  }
}
