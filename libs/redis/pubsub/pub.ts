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
import { Validator } from '@sidewinder/validator'
import { RedisEncoder } from '../encoder'
import { RedisConnect } from '../connect'
import { Static, TSchema } from '../type'

export class RedisPub<Schema extends TSchema> {
  private readonly validator: Validator<TSchema>
  private readonly encoder: RedisEncoder
  private ended: boolean

  constructor(public readonly topic: string, private readonly schema: Schema, private readonly redis: Redis) {
    this.validator = new Validator(this.schema)
    this.encoder = new RedisEncoder(this.schema)
    this.ended = false
  }

  /** Publishes the given value to the topic. */
  public async send(value: Static<Schema>): Promise<void> {
    if (this.ended) return
    this.validator.assert(value)
    await this.redis.publish(this.encodeKey(), this.encoder.encode(value))
  }

  /** Disposes of this publisher */
  public dispose() {
    this.ended = true
    this.redis.disconnect(false)
  }

  // ------------------------------------------------------------
  // Key Encoding
  // ------------------------------------------------------------

  private encodeKey() {
    return `topic::${this.topic}`
  }

  // ------------------------------------------------------------
  // Connect
  // ------------------------------------------------------------

  /** Connects to Redis with the given parameters */
  public static connect<Schema extends TSchema = TSchema>(topic: string, schema: Schema, port?: number, host?: string, options?: RedisOptions): Promise<RedisPub<Schema>>
  /** Connects to Redis with the given parameters */
  public static connect<Schema extends TSchema = TSchema>(topic: string, schema: Schema, host?: string, options?: RedisOptions): Promise<RedisPub<Schema>>
  /** Connects to Redis with the given parameters */
  public static connect<Schema extends TSchema = TSchema>(topic: string, schema: Schema, options: RedisOptions): Promise<RedisPub<Schema>>
  public static async connect(...args: any[]): Promise<any> {
    const [topic, schema, params] = [args[0], args[1], args.slice(2)]
    return new RedisPub(topic, schema, await RedisConnect.connect(...params))
  }
}
