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

import { Cluster, Redis, RedisOptions } from 'ioredis'
import { Static, TSchema } from '@sidewinder/type'
import { Channel, Receiver } from '@sidewinder/channel'
import { RedisDecoder } from '../../codecs/index'
import { RedisConnect } from '../../connect'

/** Redis PubSub Receiver. This type uses broadcast semantics. */
export class PubSubRedisReceiver<T extends TSchema> implements Receiver<Static<T>> {
  readonly #decoder: RedisDecoder<T>
  readonly #channel: Channel<unknown>

  constructor(private readonly schema: T, public readonly channel: string, private readonly redis: Cluster | Redis) {
    this.#decoder = new RedisDecoder(this.schema)
    this.#channel = new Channel<unknown>()
    this.redis.subscribe(this.#encodeKey())
    this.redis.on('message', (event, value) => this.#onMessage(event, value))
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
    const next = await this.#channel.next()
    if (next === null) return null
    return next
  }

  /** Closes this receiver */
  public close() {
    this.#channel.end()
    this.redis.disconnect(false)
  }

  // ------------------------------------------------------------
  // Events
  // ------------------------------------------------------------

  #onMessage(_event: string, value: string) {
    try {
      this.#channel.send(this.#decoder.decode(value))
    } catch {
      console.warn(`PubSubRedisReceiver: Invalid value received on '${this.channel}' channel.`, value)
    }
  }

  // ------------------------------------------------------------
  // Key Encoding
  // ------------------------------------------------------------

  #encodeKey() {
    return `sw::topic:${this.channel}`
  }

  // ------------------------------------------------------------
  // Factory
  // ------------------------------------------------------------

  /** Connects to Redis with the given parameters */
  public static Create<T extends TSchema>(schema: T, topic: string, port?: number, host?: string, options?: RedisOptions): Promise<PubSubRedisReceiver<T>>
  /** Connects to Redis with the given parameters */
  public static Create<T extends TSchema>(schema: T, topic: string, host?: string, options?: RedisOptions): Promise<PubSubRedisReceiver<T>>
  /** Connects to Redis with the given parameters */
  public static Create<T extends TSchema>(schema: T, topic: string, options: RedisOptions): Promise<PubSubRedisReceiver<T>>
  public static async Create(...args: any[]): Promise<any> {
    const [schema, topic, params] = [args[0], args[1], args.slice(2)]
    return new PubSubRedisReceiver(schema, topic, await RedisConnect.connect(...params))
  }
}
