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

import { Redis } from 'ioredis'
import { Validator } from '@sidewinder/validator'
import { RedisEncoder } from '../encoder'
import { TSchema } from '../type'


export class RedisList<T> {

    private readonly validator: Validator<TSchema>
    private readonly encoder: RedisEncoder

    constructor(private readonly schema: TSchema, private readonly redis: Redis, private readonly keyspace: string) {
        this.validator = new Validator(this.schema)
        this.encoder = new RedisEncoder(this.schema)
    }

    public async * [Symbol.asyncIterator]() {
        const length = await this.redis.llen(this.resolveKey())
        const slice = 32
        for(let i = 0; i < length; i += slice) {
            for(const value of await this.redis.lrange(this.resolveKey(), i, i + slice)) {
                yield this.encoder.decode<T>(value)
            }
        } 
    }

    /** Clears this list */
    public async clear() {
        return await this.redis.del(this.resolveKey())
    }

    /** Returns the length of this length */
    public async length(): Promise<number> {
        return await this.redis.llen(this.resolveKey())
    }

    /** Returns the value at the given index */
    public async index(index: number): Promise<T | undefined> {
        const value = await this.redis.lindex(this.resolveKey(), index)
        if(value === null) return undefined
        return this.encoder.decode(value)
    }

    /** Pushes a value to the end of this list */
    public async push(...values: T[]) {
        for(const value of values) {
            this.validator.assert(value)
        }
        for(const value of values) {
            await this.redis.rpush(this.resolveKey(), this.encoder.encode(value))
        }
    }

    /** Pushes a value to the start of this list */
    public async unshift(...values: T[]): Promise<any> {
        for(const value of values) {
            this.validator.assert(value)
        }
        for(const value of values.reverse()) {
            await this.redis.lpush(this.resolveKey(), this.encoder.encode(value))
        }
    }

    /** Pops a value from the end of this list or undefined if empty */
    public async pop(): Promise<T | undefined> {
        const value = await this.redis.rpop(this.resolveKey())
        if(value === null) return undefined
        return this.encoder.decode(value)
    }

    /** Shifts a value from the start of this list or undefined if empty */
    public async shift(): Promise<T | undefined> {
        const value = await this.redis.lpop(this.resolveKey())
        if(value === null) return undefined
        return this.encoder.decode(value)
    }

    private resolveKey() {
        return `list:${this.keyspace}`
    }
}