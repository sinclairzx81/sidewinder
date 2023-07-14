/*--------------------------------------------------------------------------

@sidewinder/async

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

import { Delay } from './delay'

export class RetryError extends Error {
  constructor(message: string) {
    super(message)
  }
}

export type RetryCallback<T> = (attempt: number) => Promise<T>

export interface RetryOptions {
  /** The number of attempts before throwing last error (default is 4) */
  attempts?: number
  /** The delay between subsequent retry attempts (default is 1000) */
  delay?: number
}
export namespace Retry {
  /** Runs the given callback repeatedly until result `T` can be resolved. Will throw last error if attempts exceed threshold */
  export async function run<T>(callback: RetryCallback<T>, options: RetryOptions = {}): Promise<T> {
    options.attempts = options.attempts === undefined ? 4 : options.attempts
    options.delay = options.delay === undefined ? 1000 : options.delay
    if (options.delay < 0) throw new RetryError('Minumum delay is 0')
    if (options.attempts < 1) throw new RetryError(`Minimum retry attempts must be greater than 1`)
    let lastError: unknown = null
    for (let attempt = 0; attempt < options.attempts; attempt++) {
      try {
        return await callback(attempt)
      } catch (error) {
        lastError = error
        await Delay.wait(options.delay)
      }
    }
    throw lastError
  }
}
