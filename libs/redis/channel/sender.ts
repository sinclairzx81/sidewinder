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
import { SyncSender } from '@sidewinder/channel'
import { Validator } from '@sidewinder/validator'
import { RedisConnect } from '../connect'
import { RedisEncoder } from '../encoder'
import { Static, TSchema } from '../type'
import { Message } from './message'

/** 
 * A RedisSender is the sending side of a Redis backed channel. This RedisSender writes values a 
 * Redis via RPUSH which are received on the Receiver via (blocking) BRLPOP. There can be
 * multiple RedisSender writers writing to a single channel. This replicates the mpsc behaviour
 * of Sidewinder channels across Redis.
 */
export class RedisSender<Schema extends TSchema> implements SyncSender<Static<Schema>> {
    private readonly validator: Validator<TSchema>
    private readonly encoder: RedisEncoder
    private ended: boolean

    constructor(private readonly channel: string, private readonly schema: TSchema, private readonly redis: Redis) {
        this.validator = new Validator(this.schema)
        this.encoder = new RedisEncoder(this.schema)
        this.ended = false
    }

    /** Sends the given value to this channel. If channel has ended no action. */
    public async send(value: Static<Schema>): Promise<void> {
        if (this.ended) return
        this.validator.assert(value)
        const message: Static<typeof Message> = { type: 'next', value }
        await this.redis.rpush(this.encodeKey(), this.encoder.encode(message))
    }

    /** Sends the given error to this channel causing the receiver to throw on next(). If channel has ended no action. */
    public async error(error: Error): Promise<void> {
        if (this.ended) return
        this.ended = true
        {
            const message: Static<typeof Message> = { type: 'error', error: error.message }
            await this.redis.rpush(this.encodeKey(), this.encoder.encode(message))
        }
        const message: Static<typeof Message> = { type: 'end' }
        await this.redis.rpush(this.encodeKey(), this.encoder.encode(message))
        this.redis.disconnect()
    }

    /** Ends this channel. This will disconnect this sender from Redis. */
    public async end(): Promise<void> {
        if (this.ended) return
        this.ended = true
        const message: Static<typeof Message> = { type: 'end' }
        await this.redis.rpush(this.encodeKey(), this.encoder.encode(message))
        this.redis.disconnect(false)
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
    public static connect<Schema extends TSchema = TSchema>(channel: string, schema: Schema, port?: number, host?: string, options?: RedisOptions): Promise<RedisSender<Schema>>
    /** Connects to Redis with the given parameters */
    public static connect<Schema extends TSchema = TSchema>(channel: string, schema: Schema, host?: string, options?: RedisOptions): Promise<RedisSender<Schema>>
    /** Connects to Redis with the given parameters */
    public static connect<Schema extends TSchema = TSchema>(channel: string, schema: Schema, options: RedisOptions): Promise<RedisSender<Schema>>
    public static async connect(...args: any[]): Promise<any> {
        const [channel, schema, params] = [args[0], args[1], args.slice(2)]
        return new RedisSender(channel, schema, await RedisConnect.connect(...params))
    }
}