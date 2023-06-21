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

import { Static, TSchema } from '@sidewinder/type'
import { Receiver } from '@sidewinder/channel'
import { Redis, RedisOptions } from 'ioredis'
import { RedisDecoder } from '../../codecs/index'
import { RedisConnect } from '../../connect'

/** Redis Receiver. This type uses multi sender, single receiver semantics. */
export class RedisReceiver<T extends TSchema> implements Receiver<Static<T>> {
  readonly #decoder: RedisDecoder<T>
  #closed: boolean
  constructor(private readonly schema: T, private readonly channel: string, private readonly redis: Redis) {
    this.#decoder = new RedisDecoder<T>(this.schema)
    this.#closed = false
  }

  /** Async iterator for this Receiver */
  public async *[Symbol.asyncIterator]() {
    while (true) {
      const next = await this.next()
      if (next === null) return
      yield next
    }
  }

  /** Reads the next value from this Receiver */
  public async next(): Promise<Static<T> | null> {
    while (true) {
      if (this.#closed) return null
      const response = await this.redis.blpop(this.encodeKey(), 0)
      if (!response) return null
      const [_, value] = response
      try {
        return this.#decoder.decode(value)
      } catch {
        console.warn(`RedisReceiver: Invalid value received on '${this.channel}' channel.`, value)
      }
    }
  }

  /** Closes this receiver */
  public close() {
    this.#closed = true
    this.redis.disconnect(false)
  }

  // ------------------------------------------------------------
  // Key Encoding
  // ------------------------------------------------------------

  private encodeKey() {
    return `sw::channel:${this.channel}`
  }

  // ------------------------------------------------------------
  // Factory
  // ------------------------------------------------------------

  /** Creates a RedisReceiver with the given parameters */
  public static Create<T extends TSchema = TSchema>(schema: T, channel: string, port?: number, host?: string, options?: RedisOptions): Promise<RedisReceiver<T>>
  /** Creates a RedisReceiver with the given parameters */
  public static Create<T extends TSchema = TSchema>(schema: T, channel: string, host?: string, options?: RedisOptions): Promise<RedisReceiver<T>>
  /** Creates a RedisReceiver with the given parameters */
  public static Create<T extends TSchema = TSchema>(schema: T, channel: string, options: RedisOptions): Promise<RedisReceiver<T>>
  public static async Create(...args: any[]): Promise<any> {
    const [schema, channel, params] = [args[0], args[1], args.slice(2)]
    return new RedisReceiver(schema, channel, await RedisConnect.Connect(...params))
  }
}
