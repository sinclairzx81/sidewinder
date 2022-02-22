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

import { Timeout } from '@sidewinder/async'
import IORedis, { RedisOptions, Redis } from 'ioredis'

export namespace RedisConnect {
    /** Connects to Redis with the given parameters */
    export function connect(port?: number, host?: string, options?: RedisOptions): Promise<Redis>
    /** Connects to Redis with the given parameters */
    export function connect(host?: string, options?: RedisOptions): Promise<Redis>
    /** Connects to Redis with the given parameters */
    export function connect(options: RedisOptions): Promise<Redis>
    export async function connect(...args: any[]): Promise<any> {
        const redis = new IORedis(...args)
        await Timeout.run(8000, async () => await redis.echo('echo'), new Error('Connection to Redis timed out'))
        return redis
    }
}
