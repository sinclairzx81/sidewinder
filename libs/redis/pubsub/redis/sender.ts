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
import { SyncSender } from '@sidewinder/channel'
import { Static, TSchema } from '@sidewinder/type'
import { RedisEncoder } from '../../codecs/index'
import { RedisConnect } from '../../connect'

/** Redis PubSub Sender. This type uses broadcast semantics. */
export class PubSubRedisSender<T extends TSchema> implements SyncSender<Static<T>> {
  readonly #encoder: RedisEncoder<T>
  #ended: boolean

  constructor(private readonly schema: T, private readonly channel: string, private readonly redis: Cluster | Redis) {
    this.#encoder = new RedisEncoder(this.schema)
    this.#ended = false
  }

  /** Sends a value to this sender */
  public async send(value: Static<T>): Promise<void> {
    if (this.#ended) return
    await this.redis.publish(this.#encodeKey(), this.#encoder.encode(value))
  }

  /** Sends an error to this sender and closes. Note that redis channels do not transmit the error. */
  public async error(error: Error): Promise<void> {
    this.#dispose()
  }

  /** Ends this sender and closes */
  public async end(): Promise<void> {
    this.#dispose()
  }

  #dispose() {
    this.#ended = true
    this.redis.disconnect(false)
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
  public static Create<T extends TSchema>(schema: T, channel: string, port?: number, host?: string, options?: RedisOptions): Promise<PubSubRedisSender<T>>
  /** Connects to Redis with the given parameters */
  public static Create<T extends TSchema>(schema: T, channel: string, host?: string, options?: RedisOptions): Promise<PubSubRedisSender<T>>
  /** Connects to Redis with the given parameters */
  public static Create<T extends TSchema>(schema: T, channel: string, options: RedisOptions): Promise<PubSubRedisSender<T>>
  public static async Create(...args: any[]): Promise<any> {
    const [schema, topic, params] = [args[0], args[1], args.slice(2)]
    return new PubSubRedisSender(schema, topic, await RedisConnect.connect(...params))
  }
}
