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

import { Static, TSchema } from '@sidewinder/type'
import { Validator } from '@sidewinder/validator'
import { SyncSender } from '@sidewinder/channel'
import { Queues } from './queue'

export class MemorySenderError extends Error {
  constructor(message: string) {
    super(`MemorySender: ${message}`)
  }
}

export class MemorySender<T extends TSchema> implements SyncSender<Static<T>> {
  readonly #validator: Validator<T>
  #closed: boolean
  constructor(private readonly schema: T, private readonly channel: string) {
    this.#validator = new Validator(this.schema)
    this.#closed = false
  }

  public async send(value: Static<T, []>): Promise<void> {
    if (this.#closed) throw new MemorySenderError('Sender is closed')
    const check = this.#validator.check(value)
    if (!check.success) throw new MemorySenderError(check.errorText)
    Queues.send(this.channel, { type: 'next', value })
  }

  public async error(error: Error): Promise<void> {
    Queues.send(this.channel, { type: 'error', error: error.message })
    Queues.send(this.channel, { type: 'end' })
    this.#closed = true
  }

  public async end(): Promise<void> {
    Queues.send(this.channel, { type: 'end' })
    this.#closed = true
  }
}
