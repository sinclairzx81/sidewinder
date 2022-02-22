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
import { Receiver } from '@sidewinder/channel'
import { Validator } from '@sidewinder/validator'
import { RedisConnect } from '../connect'
import { Static, TSchema } from '../type'
import { Message, MessageValidator } from './message'
import { RedisEncoder } from '../encoder'

/**
 * A RedisReceiver is the receiving side of a Redis backed channel. There should only
 * be one RedisReceiver on a per channel basis. This receiver will disconnect from
 * Redis if it receives a end signal from the RedisSender.
 */
export class RedisReceiver<Schema extends TSchema> implements Receiver<Static<Schema>> {
  private readonly encoder: RedisEncoder
  private readonly validator: Validator<TSchema>

  constructor(private readonly channel: string, private readonly schema: TSchema, private readonly redis: Redis) {
    this.encoder = new RedisEncoder(this.schema)
    this.validator = new Validator(this.schema)
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
  public async next(): Promise<Static<Schema> | null> {
    const [_, value] = await this.redis.blpop(this.encodeKey(), 0)
    const message = this.encoder.decode<Static<typeof Message>>(value)
    MessageValidator.assert(message)
    switch (message.type) {
      case 'next': {
        this.validator.assert(message.value)
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
    return `channel::${this.channel}`
  }

  // ------------------------------------------------------------
  // Connect
  // ------------------------------------------------------------

  /** Connects to Redis with the given parameters */
  public static connect<Schema extends TSchema = TSchema>(channel: string, schema: Schema, port?: number, host?: string, options?: RedisOptions): Promise<RedisReceiver<Schema>>
  /** Connects to Redis with the given parameters */
  public static connect<Schema extends TSchema = TSchema>(channel: string, schema: Schema, host?: string, options?: RedisOptions): Promise<RedisReceiver<Schema>>
  /** Connects to Redis with the given parameters */
  public static connect<Schema extends TSchema = TSchema>(channel: string, schema: Schema, options: RedisOptions): Promise<RedisReceiver<Schema>>
  public static async connect(...args: any[]): Promise<any> {
    const [channel, schema, params] = [args[0], args[1], args.slice(2)]
    return new RedisReceiver(channel, schema, await RedisConnect.connect(...params))
  }
}
