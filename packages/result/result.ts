/*--------------------------------------------------------------------------

@sidewinder/result

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

export class Result<Value> {
  #value: Value | undefined
  #error: Error | undefined
  constructor(value?: Value, error?: Error) {
    this.#value = value
    this.#error = error
  }
  public ok() {
    return this.#error === undefined
  }

  public value() {
    if (this.ok()) return this.#value!
    throw new Error('Result has no value')
  }

  public error() {
    if (!this.ok()) return this.#error!
    throw new Error('Result has no error')
  }

  public static ok<T>(value: T): Result<T> {
    return new Result(value, undefined)
  }

  public static error<T>(error: Error): Result<T> {
    return new Result(undefined as any, error)
  }
}
