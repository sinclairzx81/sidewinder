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

import { Cluster, Redis } from 'ioredis'
import { Mutex, Lock, Lockable } from '@sidewinder/async'
import * as Redlock from 'redlock'

const RedlockConstructor = Redlock.default

// ------------------------------------------------------------------
// Defaults
// ------------------------------------------------------------------
export function DefaultRedlockSettings(): Redlock.Settings {
  return {
    driftFactor: 0.01,
    retryCount: 10,
    retryDelay: 200,
    retryJitter: 200,
    automaticExtensionThreshold: 500,
  }
}
// ------------------------------------------------------------------
// RedisMutexLockError
// ------------------------------------------------------------------
export class RedisMutexLockError extends Error {
  constructor(message: string) {
    super(message)
  }
}
// ------------------------------------------------------------------
// RedisMutexOptions
// ------------------------------------------------------------------
export interface RedisMutexOptions {
  /** The resource being locked */
  resource: string
  /** The maximum lifetime in milliseconds in which a lock can be held */
  lifetime: number
  /** If true will log lock & release errors to stdout */
  logError?: boolean
}
// ------------------------------------------------------------------
// RedisMutex
// ------------------------------------------------------------------
export type RedisInstanceArray = Array<RedisInstance>
export type RedisInstance = Redis | Cluster

/** Creates a Redis mutex that issues temporal lifetime locks  */
export class RedisMutex implements Lockable {
  readonly #mutex: Mutex
  readonly #redlock: InstanceType<typeof RedlockConstructor>
  readonly #options: RedisMutexOptions

  constructor(redis: RedisInstanceArray, options: RedisMutexOptions, settings?: Redlock.Settings)
  constructor(redis: RedisInstance, options: RedisMutexOptions, settings?: Redlock.Settings)
  constructor(redis: RedisInstanceArray | RedisInstance, options: RedisMutexOptions, settings: Redlock.Settings = DefaultRedlockSettings()) {
    this.#options = options
    this.#options.logError ?? false
    this.#mutex = new Mutex()
    this.#redlock = new Redlock.default(Array.isArray(redis) ? redis : [redis], settings)
    this.#redlock.on('error', (error) => this.#logError(error))
  }
  // ----------------------------------------------------------------
  // Lock
  // ----------------------------------------------------------------
  public async lock(): Promise<Lock> {
    const memlock = await this.#mutex.lock()
    const state = { released: false }
    try {
      const redlock = await this.#redlock.acquire([this.#resolveKey()], this.#options.lifetime)
      setTimeout(() => this.#releaseLocks(state, memlock, redlock), this.#options.lifetime)
      return new Lock(() => this.#releaseLocks(state, memlock, redlock))
    } catch (error) {
      memlock.dispose() // ensure disposed
      throw new RedisMutexLockError('Unable to acquire lock')
    }
  }
  // ----------------------------------------------------------------
  // Release Locks
  // ----------------------------------------------------------------
  async #releaseLocks(state: { released: boolean }, memlock: Lock, redlock: Redlock.Lock) {
    if (state.released) return
    state.released = true
    await redlock.release().catch((error) => this.#logError(error))
    memlock.dispose()
  }
  // ----------------------------------------------------------------
  // Logging
  // ----------------------------------------------------------------
  #logError(...args: any) {
    if (!this.#options.logError) return
    console.error(...args)
  }
  // ----------------------------------------------------------------
  // Resolve Key
  // ----------------------------------------------------------------
  #resolveKey() {
    return `mutex::${this.#options.resource}`
  }
}
