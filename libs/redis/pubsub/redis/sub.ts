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

import { Redis, RedisOptions } from 'ioredis'
import { Channel } from '@sidewinder/channel'
import { Validator } from '@sidewinder/validator'
import { RedisEncoder } from '../../encoder'
import { Static, TSchema } from '../../type'
import { RedisConnect } from '../../connect'
import { Sub } from '../sub'

export class RedisSub<T extends TSchema> implements Sub<Static<T>> {
  readonly #validator: Validator<TSchema>
  readonly #encoder: RedisEncoder
  readonly #channel: Channel<Static<T>>

  constructor(private readonly schema: TSchema, public readonly topic: string, private readonly redis: Redis) {
    this.#validator = new Validator(this.schema)
    this.#encoder = new RedisEncoder(this.schema)
    this.#channel = new Channel<Static<T>>()
    this.redis.subscribe(this.#encodeKey())
    this.redis.on('message', (channel, value) => this.#onMessage(channel, value))
  }

  /** Async iterator for this subscriber. */
  public async *[Symbol.asyncIterator]() {
    while (true) {
      const next = await this.next()
      if (next === null) return null
      yield next
    }
  }

  /** Receives the next message from this topic. */
  public async next(): Promise<Static<T> | null> {
    const next = await this.#channel.next()
    if (next === null) return null
    return next
  }

  /** Disposes of this subscriber */
  public dispose() {
    this.#channel.end()
    this.redis.disconnect(false)
  }

  // ------------------------------------------------------------
  // Events
  // ------------------------------------------------------------

  #onMessage(event: string, value: string) {
    try {
      const data = this.#encoder.decode<Static<T>>(value)
      this.#validator.assert(data)
      this.#channel.send(data)
    } catch {}
  }

  // ------------------------------------------------------------
  // Key Encoding
  // ------------------------------------------------------------

  #encodeKey() {
    return `sw::topic:${this.topic}`
  }

  // ------------------------------------------------------------
  // Connect
  // ------------------------------------------------------------

  /** Connects to Redis with the given parameters */
  public static connect<Schema extends TSchema = TSchema>(schema: Schema, topic: string, port?: number, host?: string, options?: RedisOptions): Promise<RedisSub<Schema>>
  /** Connects to Redis with the given parameters */
  public static connect<Schema extends TSchema = TSchema>(schema: Schema, topic: string, host?: string, options?: RedisOptions): Promise<RedisSub<Schema>>
  /** Connects to Redis with the given parameters */
  public static connect<Schema extends TSchema = TSchema>(schema: Schema, topic: string, options: RedisOptions): Promise<RedisSub<Schema>>
  public static async connect(...args: any[]): Promise<any> {
    const [schema, topic, params] = [args[0], args[1], args.slice(2)]
    return new RedisSub(schema, topic, await RedisConnect.connect(...params))
  }
}
