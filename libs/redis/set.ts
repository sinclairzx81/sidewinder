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
import { RedisEncoder } from './encoder'
import { TSchema } from './type'


export class RedisSet<T> {
    private readonly validator: Validator<TSchema>
    private readonly encoder: RedisEncoder

    constructor(private readonly schema: TSchema, private readonly redis: Redis, private readonly keyspace: string) {
        this.validator = new Validator(schema)
        this.encoder = new RedisEncoder(schema)
    }
    
    public async add(value: T) {

    }

    public async delete(value: T) {

    }
    
    public async clear() {

    }

    public async * values(): AsyncIterable<T> {

    }
    private resolveKey() {
        return `set:${this.keyspace}`
    }
}