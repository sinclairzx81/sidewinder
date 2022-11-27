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
import { Static, TSchema } from '@sidewinder/type'
import { SyncSender } from '@sidewinder/channel'
import { RedisEncoder } from '../../codecs/index'
import { RedisConnect } from '../../connect'
import { Message } from './message'

export class RedisSender<T extends TSchema> implements SyncSender<Static<T>> {
  readonly #encoder: RedisEncoder<Message<T>>
  #ended: boolean
  constructor(private readonly schema: TSchema, private readonly channel: string, private readonly redis: Redis) {
    this.#encoder = new RedisEncoder(Message(this.schema))
    this.#ended = false
  }

  /** Sends the given value to this channel. If channel has ended no action. */
  public async send(value: Static<T>): Promise<void> {
    if (this.#ended) return
    await this.redis.rpush(this.encodeKey(), this.#encoder.encode({ type: 'next', value }))
  }

  /** Sends the given error to this channel causing the receiver to throw on next(). If channel has ended no action. */
  public async error(error: Error): Promise<void> {
    if (this.#ended) return
    this.#ended = true
    await this.redis.rpush(this.encodeKey(), this.#encoder.encode({ type: 'error', error: error.message }))
    await this.redis.rpush(this.encodeKey(), this.#encoder.encode({ type: 'end' }))
    this.redis.disconnect()
  }

  /** Ends this channel. This will disconnect this sender from Redis. */
  public async end(): Promise<void> {
    if (this.#ended) return
    this.#ended = true
    await this.redis.rpush(this.encodeKey(), this.#encoder.encode({ type: 'end' }))
    this.redis.disconnect(false)
  }

  // ------------------------------------------------------------
  // Key Encoding
  // ------------------------------------------------------------

  private encodeKey() {
    return `sw::channel:${this.channel}`
  }

  // ------------------------------------------------------------
  // Connect
  // ------------------------------------------------------------

  /** Connects to Redis with the given parameters */
  public static connect<Schema extends TSchema = TSchema>(schema: Schema, channel: string, port?: number, host?: string, options?: RedisOptions): Promise<RedisSender<Schema>>
  /** Connects to Redis with the given parameters */
  public static connect<Schema extends TSchema = TSchema>(schema: Schema, channel: string, host?: string, options?: RedisOptions): Promise<RedisSender<Schema>>
  /** Connects to Redis with the given parameters */
  public static connect<Schema extends TSchema = TSchema>(schema: Schema, channel: string, options: RedisOptions): Promise<RedisSender<Schema>>
  public static async connect(...args: any[]): Promise<any> {
    const [schema, channel, params] = [args[0], args[1], args.slice(2)]
    return new RedisSender(schema, channel, await RedisConnect.connect(...params))
  }
}
