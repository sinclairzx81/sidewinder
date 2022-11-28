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
import { Channel, Receiver } from '@sidewinder/channel'
import { RedisDecoder } from '../../codecs/index'
import { RedisConnect } from '../../connect'

export class RedisPubSubReceiver<T extends TSchema> implements Receiver<Static<T>> {
  readonly #decoder: RedisDecoder<T>
  readonly #channel: Channel<unknown>

  constructor(private readonly schema: T, public readonly channel: string, private readonly redis: Redis) {
    this.#decoder = new RedisDecoder(this.schema)
    this.#channel = new Channel<unknown>()
    this.redis.subscribe(this.#encodeKey())
    this.redis.on('message', (event, value) => this.#onMessage(event, value))
  }

  public async *[Symbol.asyncIterator]() {
    while (true) {
      const next = await this.next()
      if (next === null) return
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
      this.#channel.send(this.#decoder.decode(value))
    } catch {}
  }

  // ------------------------------------------------------------
  // Key Encoding
  // ------------------------------------------------------------

  #encodeKey() {
    return `sw::topic:${this.channel}`
  }

  // ------------------------------------------------------------
  // Connect
  // ------------------------------------------------------------

  /** Connects to Redis with the given parameters */
  public static connect<Schema extends TSchema = TSchema>(schema: Schema, topic: string, port?: number, host?: string, options?: RedisOptions): Promise<RedisPubSubReceiver<Schema>>
  /** Connects to Redis with the given parameters */
  public static connect<Schema extends TSchema = TSchema>(schema: Schema, topic: string, host?: string, options?: RedisOptions): Promise<RedisPubSubReceiver<Schema>>
  /** Connects to Redis with the given parameters */
  public static connect<Schema extends TSchema = TSchema>(schema: Schema, topic: string, options: RedisOptions): Promise<RedisPubSubReceiver<Schema>>
  public static async connect(...args: any[]): Promise<any> {
    const [schema, topic, params] = [args[0], args[1], args.slice(2)]
    return new RedisPubSubReceiver(schema, topic, await RedisConnect.connect(...params))
  }
}

import { Type } from '@sidewinder/type'

const receiver = new RedisPubSubReceiver(Type.String(), null as any, null as any)
receiver.next()
