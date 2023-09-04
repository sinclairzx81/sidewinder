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

import { Store } from '../store/index'
import { TDatabase } from '../type'
import { RedisArray } from './array'
import { RedisMap } from './map'
import { RedisSet } from './set'
import { RedisSortedSet } from './sorted-set'

/** Typed Redis Database */
export class RedisDatabase<Database extends TDatabase> {
  readonly #arrays: Map<string, RedisArray<any>>
  readonly #maps: Map<string, RedisMap<any>>
  readonly #sets: Map<string, RedisSet<any>>
  readonly #sortedsets: Map<string, RedisSortedSet<any>>

  constructor(private readonly schema: Database, private readonly store: Store) {
    this.#arrays = new Map<string, RedisArray<any>>()
    this.#maps = new Map<string, RedisMap<any>>()
    this.#sets = new Map<string, RedisSet<any>>()
    this.#sortedsets = new Map<string, RedisSortedSet<any>>()
  }

  /** Returns a RedisArray type */
  public array<Name extends keyof Database['arrays']>(name: Name): RedisArray<Database['arrays'][Name]> {
    const schema = (this.schema['arrays'] as any)[name as string]
    if (schema === undefined) throw Error(`The list '${name as string}' not defined in redis schema`)
    if (!this.#arrays.has(name as string)) this.#arrays.set(name as string, new RedisArray<any>(schema, this.store, name as string))
    return this.#arrays.get(name as string)!
  }

  /** Returns a RedisMap type */
  public map<Name extends keyof Database['maps']>(name: Name): RedisMap<Database['maps'][Name]> {
    const schema = (this.schema['maps'] as any)[name as string]
    if (schema === undefined) throw Error(`The map '${name as string}' not defined in redis schema`)
    if (!this.#maps.has(name as string)) this.#maps.set(name as string, new RedisMap<any>(schema, this.store, name as string))
    return this.#maps.get(name as string)!
  }

  /** Returns a RedisSet type */
  public set<Name extends keyof Database['sets']>(name: Name): RedisSet<Database['sets'][Name]> {
    const schema = (this.schema['sets'] as any)[name as string]
    if (schema === undefined) throw Error(`The set '${name as string}' not defined in redis schema`)
    if (!this.#sets.has(name as string)) this.#sets.set(name as string, new RedisSet<any>(schema, this.store, name as string))
    return this.#sets.get(name as string)!
  }

  public sortedset<Name extends keyof Database['sortedsets']>(name: Name): RedisSortedSet<Database['sortedsets'][Name]> {
    const schema = (this.schema['sortedsets'] as any)[name as string]
    if (schema === undefined) throw Error(`The sorted set '${name as string}' not defined in redis schema`)
    if (!this.#sortedsets.has(name as string)) this.#sortedsets.set(name as string, new RedisSortedSet<any>(schema, this.store, name as string))
    return this.#sortedsets.get(name as string)!
  }

  /** Disposes of this database */
  public dispose() {
    this.store.disconnect()
  }
}
