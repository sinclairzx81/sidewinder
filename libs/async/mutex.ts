/*--------------------------------------------------------------------------

@sidewinder/async

The MIT License (MIT)

Copyright (c) 2022-2024 Haydn Paterson (sinclair) <haydn.developer@gmail.com>

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

import { Lock, Lockable } from './lock'
import { Deferred } from './deferred'

/** In-memory mutex used to prevent concurrent access on asynchronous resources */
export class Mutex implements Lockable {
  #queue: Array<Deferred<Lock>>
  #running: boolean
  constructor() {
    this.#running = false
    this.#queue = []
  }
  /** Acquires a lock. */
  public async lock(): Promise<Lock> {
    const deferred = new Deferred<Lock>()
    this.#queue.push(deferred)
    this.#dispatch()
    return deferred.promise()
  }
  #condition() {
    return this.#running === false && this.#queue.length > 0
  }
  #dispatch() {
    if (!this.#condition()) return
    this.#running = true
    const next = this.#queue.shift()!
    const lock = new Lock(() => {
      this.#running = false
      this.#dispatch()
    })
    next.resolve(lock)
  }
}
