/*--------------------------------------------------------------------------

@sidewinder/query

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

export type ResultMap<T, U> = (input: T) => U

export class Result<T> {
  constructor(private readonly value?: T, private readonly error?: Error) {}
  /** Returns true if this result has a value. */
  public Ok(): boolean {
    return this.error === undefined
  }

  /** Returns the error of this result. */
  public Error(): Error {
    return this.error!
  }

  /** Returns the value of this result. */
  public Value(): T {
    return this.value!
  }

  /** Maps this Result into a new form. If Error no action. */
  public Map<U>(func: ResultMap<T, U>): Result<U> {
    return this.Ok() ? new Result(func(this.Value())) : new Result<U>(undefined, this.error)
  }

  /** Creates a new Result with the given value. */
  public static Ok<T>(value: T): Result<T> {
    return new Result<T>(value, undefined)
  }

  /** Creates a new Result with the given error. */
  public static Error<T>(error: string | Error): Result<T> {
    return typeof error === 'string' ? new Result<T>(undefined, globalThis.Error(error)) : new Result<T>(undefined, error)
  }
}
