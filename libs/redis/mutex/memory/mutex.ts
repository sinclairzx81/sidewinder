/*--------------------------------------------------------------------------

@sidewinder/redis

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

import { Mutex, Lock, Lockable } from '@sidewinder/async'
// ----------------------------------------------------------------
// MemoryMutexOptions
// ----------------------------------------------------------------
export interface MemoryMutexOptions {
  /** The resource being locked */
  resource: string
  /** The maximum lifetime in milliseconds in which a lock can be held */
  lifetime: number
}
// ----------------------------------------------------------------
// MemoryMutex
// ----------------------------------------------------------------
/** Creates a in memory mutex that issues temporal lifetime locks  */
export class MemoryMutex implements Lockable {
  readonly #options: MemoryMutexOptions
  constructor(options: MemoryMutexOptions) {
    this.#options = options
  }
  // ----------------------------------------------------------------
  // Lock
  // ----------------------------------------------------------------
  public async lock(): Promise<Lock> {
    const mutex = MemoryMutex.resolveMutex(this.#options.resource)
    const lock = await mutex.lock()
    setTimeout(() => lock.dispose(), this.#options.lifetime)
    return lock
  }
  // ----------------------------------------------------------------
  // Statics
  // ----------------------------------------------------------------
  private static resources: Map<string, Mutex> | undefined = new Map<string, Mutex>()

  private static resolveMutex(resource: string) {
    if (!MemoryMutex.resources) MemoryMutex.resources = new Map<string, Mutex>()
    if (!MemoryMutex.resources.has(resource)) MemoryMutex.resources.set(resource, new Mutex())
    return MemoryMutex.resources.get(resource)!
  }
}
