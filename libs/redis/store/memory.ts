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

import { SetOptions, Store } from './store'

export class MemoryStoreError extends Error {
  constructor(message: string) {
    super(`MemoryStore: ${message}`)
  }
}

/** A RedisStore that is backed JavaScript memory. */
export class MemoryStore implements Store {
  readonly #data: Map<string, string[]>
  constructor() {
    this.#data = new Map<string, string[]>()
  }
  public async del(key: string): Promise<void> {
    this.#data.delete(key)
  }
  public async llen(key: string): Promise<number> {
    this.#ensureKey(key)
    const array = this.#data.get(key)!
    return array.length
  }
  public async lset(key: string, index: number, value: string): Promise<void> {
    this.#ensureKey(key)
    const array = this.#data.get(key)!
    if (index >= array.length) throw new MemoryStoreError('Index out of range')
    array[index] = value
  }
  public async lindex(key: string, index: number): Promise<string | null> {
    if (!this.#data.has(key)) return null
    const array = this.#data.get(key)!
    const value = array[index]
    return value || null
  }
  public async rpush(key: string, value: string): Promise<void> {
    this.#ensureKey(key)
    const array = this.#data.get(key)!
    array.push(value)
  }
  public async lpush(key: string, value: string): Promise<void> {
    this.#ensureKey(key)
    const array = this.#data.get(key)!
    array.unshift(value)
  }
  public async rpop(key: string): Promise<string | null> {
    this.#ensureKey(key)
    const array = this.#data.get(key)!
    const value = array.pop()
    return value || null
  }
  public async lpop(key: string): Promise<string | null> {
    this.#ensureKey(key)
    const array = this.#data.get(key)!
    const value = array.shift()
    return value || null
  }
  public async lrange(key: string, start: number, end: number): Promise<string[]> {
    this.#ensureKey(key)
    const array = this.#data.get(key)!
    return array.slice(start, end + 1)
  }
  public async get(key: string): Promise<string | null> {
    if (!this.#data.has(key)) return null
    const array = this.#data.get(key)!
    return array[0]
  }
  public async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp(`^` + pattern.replace(/\*/g, '(.*)') + '$')
    const buffer: string[] = []
    for (const key of this.#data.keys()) {
      if (key.match(regex)) {
        buffer.push(key)
      }
    }
    return buffer
  }
  public async exists(key: string): Promise<number> {
    return this.#data.has(key) ? 1 : 0
  }
  public async expire(key: string, seconds: number): Promise<void> {
    setTimeout(() => this.#data.delete(key), seconds * 1000)
  }
  public async set(key: string, value: string, options: SetOptions = {}): Promise<boolean> {
    // Check for write conditions
    if (options.conditionalSet === 'not-exists') {
      if (this.#data.has(key)) return false
    } else if (options.conditionalSet === 'exists') {
      if (!this.#data.has(key)) return false
    }

    // Set Data
    this.#data.set(key, [value])
    return true
  }

  #ensureKey(key: string) {
    if (this.#data.has(key)) return
    this.#data.set(key, [])
  }

  public disconnect(): void {
    this.#data.clear()
  }

  // --------------------------------------------------------
  // Factory
  // --------------------------------------------------------

  /** Creates a singleton instance of a memory store */
  public static Singleton(): Store {
    if (singleton.length === 0) singleton.push(new MemoryStore())
    return singleton[0]
  }

  /** Creates a new in memory redis store */
  public static Create(): Store {
    return new MemoryStore()
  }
}

// external: static construction on some javascript build tooling may fail
const singleton: MemoryStore[] = []
