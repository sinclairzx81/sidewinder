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
import { Message } from './message'

export class RedisReceiver<T extends TSchema> implements Receiver<Static<T>> {
  readonly #decoder: RedisDecoder<Message<T>>

  constructor(private readonly schema: T, private readonly channel: string, private readonly redis: Redis) {
    const message = Message(this.schema)
    this.#decoder = new RedisDecoder<Message<T>>(message)
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
    const [_, value] = await this.redis.blpop(this.encodeKey(), 0)
    const message = this.#decoder.decode(value)
    switch (message.type) {
      case 'next': {
        return message.value
      }
      case 'error': {
        throw new Error(message.error)
      }
      case 'end': {
        await this.redis.disconnect(false)
        return null
      }
    }
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
  public static connect<Schema extends TSchema = TSchema>(schema: Schema, channel: string, port?: number, host?: string, options?: RedisOptions): Promise<RedisReceiver<Schema>>
  /** Connects to Redis with the given parameters */
  public static connect<Schema extends TSchema = TSchema>(schema: Schema, channel: string, host?: string, options?: RedisOptions): Promise<RedisReceiver<Schema>>
  /** Connects to Redis with the given parameters */
  public static connect<Schema extends TSchema = TSchema>(schema: Schema, channel: string, options: RedisOptions): Promise<RedisReceiver<Schema>>
  public static async connect(...args: any[]): Promise<any> {
    const [schema, channel, params] = [args[0], args[1], args.slice(2)]
    return new RedisReceiver(schema, channel, await RedisConnect.connect(...params))
  }
}
