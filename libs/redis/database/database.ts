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

import IORedis, { Redis, RedisOptions } from 'ioredis'
import { Timeout } from '@sidewinder/async'
import { TDatabase, Static } from '../type'
import { RedisList } from './list'
import { RedisMap } from './map'
import { RedisSet } from './set'

export class RedisDatabase<Database extends TDatabase = TDatabase> {
    constructor(private readonly schema: Database, private readonly redis: Redis) {}
    /** Returns a redis list type */
    public list<Name extends keyof Database['lists']>(name: Name): RedisList<Database['lists'][Name]> {
        const schema = (this.schema['lists'] as any)[name as string]
        if(schema === undefined) throw Error(`The list '${name}' not defined in redis schema`)
        return new RedisList(schema, this.redis, name as string)
    }
    /** Returns a redis map type */
    public map<Name extends keyof Database['maps']>(name: Name): RedisMap<Database['maps'][Name]> {
        const schema = (this.schema['maps'] as any)[name as string]
        if(schema === undefined) throw Error(`The map '${name}' not defined in redis schema`)
        return new RedisMap(schema, this.redis, name as string)
    }

    /** Returns a redis set type */
    public set<Name extends keyof Database['sets']>(name: Name): RedisSet<Database['sets'][Name]> {
        const schema = (this.schema['sets'] as any)[name as string]
        if(schema === undefined) throw Error(`The set '${name}' not defined in redis schema`)
        return new RedisSet(schema, this.redis, name as string)
    }

    /** Connects to Redis with the given parameters */
    public static connect<Database extends TDatabase = TDatabase>(schema: Database, port?: number, host?: string, options?: RedisOptions): Promise<RedisDatabase<Database>>
    /** Connects to Redis with the given parameters */
    public static connect<Database extends TDatabase = TDatabase>(schema: Database, host?: string, options?: RedisOptions): Promise<RedisDatabase<Database>>
    /** Connects to Redis with the given parameters */
    public static connect<Database extends TDatabase = TDatabase>(schema: Database, options: RedisOptions): Promise<RedisDatabase<Database>>
    public static async connect(...args: any[]): Promise<any> {
        const [schema, params] = [args[0], args.slice(1)]
        const redis = new IORedis(...params)
        await Timeout.run(8000, async () => {
            const echo = await redis.echo('echo')
            if(echo !== 'echo') throw Error('Connection assertion failed')
        }, new Error('Connection to Redis timed out'))
        return new RedisDatabase(schema, redis)
    }
}