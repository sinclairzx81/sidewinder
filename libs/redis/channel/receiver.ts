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

import { Receiver } from '@sidewinder/channel'
import { TypeCompiler, TypeCheck, TypeException } from '@sidewinder/type/compiler'
import { Message, MessageTypeCheck } from './message'
import { Redis, RedisOptions } from 'ioredis'
import { RedisConnect } from '../connect'
import { Static, TSchema } from '../type'
import { RedisEncoder } from '../encoder'

/**
 * A RedisReceiver is the receiving side of a Redis backed channel. There should only
 * be one RedisReceiver on a per channel basis. This receiver will disconnect from
 * Redis if it receives a end signal from the RedisSender.
 */
export class RedisReceiver<Schema extends TSchema> implements Receiver<Static<Schema>> {
  private readonly encoder: RedisEncoder
  private readonly typeCheck: TypeCheck<TSchema>

  constructor(private readonly schema: TSchema, private readonly channel: string, private readonly redis: Redis) {
    this.encoder = new RedisEncoder(this.schema)
    this.typeCheck = TypeCompiler.Compile(this.schema)
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
    const result = await this.redis.blpop(this.encodeKey(), 0)
    if (result === null) return null
    const [_, value] = result
    const message = this.encoder.decode<Static<typeof Message>>(value)
    if (!MessageTypeCheck.Check(message)) {
      throw new TypeException('RedisReceiver:Next', MessageTypeCheck, message)
    }
    switch (message.type) {
      case 'next': {
        this.assertType(message.value)
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

  private assertType(value: unknown) {
    if (this.typeCheck.Check(value)) return
    throw new TypeException('RedisReceiver', this.typeCheck, value)
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
