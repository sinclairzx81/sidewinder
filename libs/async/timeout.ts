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

export namespace Timeout {
  function timeout<T>(error: Error, milliseconds: number): Promise<T> {
    return new Promise<T>((_, reject) => setTimeout(() => reject(error), milliseconds))
  }
  
  /**
   * Runs the given callback and throws if it does not complete within the given millisecond window
   * @param callback The callback to run
   * @param milliseconds The maximum timeout
   * @param error User defined timeout error
   * @returns 
   */
  export async function run<T>(callback: () => Promise<T> | T, milliseconds: number, error: Error = new Error('Timeout')): Promise<T> {
    const action = Promise.resolve(callback())
    const failed = timeout<T>(error, milliseconds)
    return (await Promise.race([action, failed])) as T
  }
}

Timeout.run(() => {}, 1)