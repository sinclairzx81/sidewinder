/*--------------------------------------------------------------------------

@sidewinder/service

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

import { v4 } from 'uuid'

interface Deferred {
  context: string
  promise: Promise<unknown>
  resolve: Function
  reject: Function
}

/**
 * A Responder is a specialized async utility used to handle request response resolution
 * over WebSockets. It is a form of Deferred but supports rejecting multiple deferreds
 * via a context (for example a WebSocket identifier)
 */
export class Responder {
  readonly #deferreds: Map<string, Deferred>

  constructor() {
    this.#deferreds = new Map<string, Deferred>()
  }

  /** Registers a deferred with the given context and returns an awaitable handle. */
  public register(context: string): string {
    let resolve!: Function
    let reject!: Function
    const promise = new Promise((_resolve, _reject) => {
      resolve = _resolve
      reject = _reject
    })
    const handle = v4()
    this.#deferreds.set(handle, { context, promise, resolve, reject })
    return handle
  }

  /** Waits for the given handle to resolve. If the handle does not exist and error is thrown. */
  public async wait<T = any>(handle: string): Promise<T> {
    if (!this.#deferreds.has(handle)) throw Error('Response')
    const entry = this.#deferreds.get(handle)!
    try {
      const result = (await entry.promise) as T
      this.#deferreds.delete(handle)
      return result
    } catch (error) {
      this.#deferreds.delete(handle)
      throw error
    }
  }

  /** Resolves a deferred with the given result */
  public resolve(handle: string, result: unknown) {
    if (!this.#deferreds.has(handle)) return console.log('NO HANDLE')
    const deferred = this.#deferreds.get(handle)!
    deferred.resolve(result)
  }

  /** Rejects a deferred with the given error */
  public reject(handle: string, error: unknown) {
    if (!this.#deferreds.has(handle)) return
    const deferred = this.#deferreds.get(handle)!
    deferred.reject(error)
  }

  /** Rejects all deferreds matching the given context */
  public rejectFor(context: string, error: unknown) {
    for (const [handle, deferred] of this.#deferreds) {
      if (deferred.context === context) deferred.reject(error)
    }
  }
}
