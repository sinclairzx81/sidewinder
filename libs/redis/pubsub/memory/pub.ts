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

import { TSchema, Static } from '@sidewinder/type'
import { Validator, ValidateError } from '@sidewinder/validator'
import { Topics } from './topics'
import { Pub } from '../pub'

/** In-Memory publisher */
export class MemoryPub<T extends TSchema> implements Pub<Static<T>> {
  readonly #validator: Validator<T>
  #ended: boolean

  constructor(private readonly schema: T, private readonly topic: string) {
    this.#validator = new Validator(this.schema)
    this.#ended = false
  }

  /** Sends a message */
  public async send(value: Static<T>) {
    if (this.#ended) return
    this.#assertValue(value)
    Topics.send(this.topic, value)
  }

  /** Disposes of this publisher */
  public dispose() {
    this.#ended = true
  }

  #assertValue(value: unknown) {
    const result = this.#validator.check(value)
    if (!result.success) throw new ValidateError(result.errors)
  }
}
