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
export type RetryCallback<T> = (attempt: number) => Promise<T> | T

export interface RetryOptions {
  /**
   * The number of attempts before throwing last error
   *
   * (Default is Infinity)
   */
  attempts?: number
  /**
   * The millisecond delay between subsequent retry attempts
   *
   * (Default is 1000)
   */
  delay?: number
  /**
   * A multiplier used to increase (or decrease) the delay for subsequent retry attempts.
   * This option can be used to implement exponential back-off strategies.
   *
   * (Default is 1.0)
   */
  multiplier?: number
  /**
   * This option specifies a upper threshold for multiplied delay values. This option should be
   * set when attempt counts are high and where multipler values are greater than 1.0.
   *
   * (Default is Infinity)
   */
  maximumDelay?: number
  /**
   * This option specifies a lower threshold for multiplied delay values. This option should be
   * set when attempt counts are high and where multipler values are less than 1.0.
   *
   * (Default is 0)
   */
  minimumDelay?: number
}
export namespace Retry {
  function defaults(options: RetryOptions): Required<RetryOptions> {
    options.attempts = options.attempts === undefined ? Infinity : options.attempts
    options.delay = options.delay === undefined ? 1000 : options.delay
    options.multiplier = options.multiplier === undefined ? 1.0 : options.multiplier
    options.maximumDelay = options.maximumDelay === undefined ? Infinity : options.maximumDelay
    options.minimumDelay = options.minimumDelay === undefined ? 0 : options.minimumDelay
    return options as Required<RetryOptions>
  }
  function assert(options: Required<RetryOptions>): Required<RetryOptions> {
    if (options.delay < 0) throw new RetryError('Minimum delay is 0')
    if (options.attempts < 1) throw new RetryError(`Minimum retry attempts must be greater than 1`)
    if (options.multiplier < 0) throw new RetryError('Multiplier must be a non-negative number')
    if (options.maximumDelay < 0) throw new RetryError('MaximumDelay must be a non-negative number')
    if (options.minimumDelay < 0) throw new RetryError('MinimumDelay must be a non-negative number')
    if (options.maximumDelay < options.minimumDelay) throw new RetryError('MinimumDelay must be less than MaximumDelay')
    return options
  }

  /** Will repeatedly run the given callback until a value is successfully returned. The function will throw the last callback error if attempts exceed the configured threshold */
  export async function run<T>(callback: RetryCallback<T>, options: RetryOptions = {}): Promise<T> {
    const resolved = assert(defaults(options))
    let [delay, exception] = [options.delay, null] as [number, unknown]
    for (let attempt = 0; attempt < resolved.attempts; attempt++) {
      try {
        return await callback(attempt)
      } catch (error) {
        exception = error
        await Delay.wait(delay)
        delay = delay * resolved.multiplier
        delay = delay > resolved.maximumDelay ? resolved.maximumDelay : delay
        delay = delay < resolved.minimumDelay ? resolved.minimumDelay : delay
      }
    }
    throw exception
  }
}
