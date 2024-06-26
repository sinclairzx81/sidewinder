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

export type DebounceCallback = () => Promise<unknown> | unknown
export type ErrorCallback = (error: Error) => void

export class Debounce {
  private callback: DebounceCallback | null
  private waiting: boolean

  /**
   * Creates a new Debounce
   * @param millisecond The maximum millisecond window for this debounce
   * @param deferred Should the debounce defer the last callback to execute once a debounce window ends
   */
  constructor(private readonly millisecond: number, private readonly deferred: boolean = false) {
    this.callback = null
    this.waiting = false
  }

  public run(callback: DebounceCallback, errorCallback: ErrorCallback = () => {}) {
    if (this.deferred) {
      this.#runDeferred(callback, errorCallback)
    } else {
      this.#runDefault(callback, errorCallback)
    }
  }

  async #runDeferred(callback: DebounceCallback, errorCallback: ErrorCallback) {
    if (this.waiting) {
      this.callback = callback
      return
    }
    this.waiting = true
    this.#execute(callback).catch(errorCallback)
    await this.#delay()
    while (this.callback !== null) {
      this.#execute(this.callback).catch(errorCallback)
      this.callback = null
      await this.#delay()
    }
    this.waiting = false
  }

  async #runDefault(callback: DebounceCallback, errorCallback: ErrorCallback) {
    if (this.waiting) return
    this.waiting = true
    this.#execute(callback).catch(errorCallback)
    await this.#delay()
    this.waiting = false
  }

  async #execute(callback: DebounceCallback) {
    await callback()
  }

  #delay() {
    return new Promise((resolve) => setTimeout(resolve, this.millisecond))
  }
}
