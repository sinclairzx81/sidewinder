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

import { TDatabase, Static } from './type'
import { RedisList } from './list'
import { RedisMap } from './map'
import { RedisSet } from './set'

export class RedisDatabase<Database extends TDatabase = TDatabase> {

    constructor(private readonly schema: Database) {}

    public list<Name extends keyof Database['lists']>(name: Name): RedisList<Static<Database['lists'][Name]>> {
        return new RedisList()
    }
    public map<Name extends keyof Database['maps']>(name: Name): RedisMap<Static<Database['lists'][Name]>> {
        return new RedisMap()
    }
    public set<Name extends keyof Database['sets']>(name: Name): RedisSet<Static<Database['sets'][Name]>> {
        return new RedisSet()
    }

    public static async connect<Database extends TDatabase>(schema: Database): Promise<RedisDatabase<Database>> {
        throw 1
    }
}