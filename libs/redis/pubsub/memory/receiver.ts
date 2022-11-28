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
import { Channel, Receiver } from '@sidewinder/channel'
import { Validator } from '@sidewinder/validator'
import { MemoryChannels, SenderHandle } from './channels'

/** In-Memory Redis PubSub Receiver. This type operates on memory queue and can be used in absense of Redis infrastructure */
export class PubSubMemoryReceiver<T extends TSchema> implements Receiver<Static<T>> {
  readonly #validator: Validator<T>
  readonly #channel: Channel<Static<T>>
  readonly #handle: SenderHandle

  constructor(private readonly schema: T, private readonly channel: string) {
    this.#validator = new Validator(this.schema)
    this.#channel = new Channel()
    this.#handle = MemoryChannels.register(this.channel, this.#channel)
  }

  /** Async iterator for this Receiver */
  public async *[Symbol.asyncIterator]() {
    while (true) {
      const next = await this.next()
      if (next === null) return
      yield next
    }
  }

  /** Reads the next value from this Receiver */
  public async next(): Promise<Static<T, []> | null> {
    while (true) {
      const next = await this.#channel.next()
      if (this.next === null) return null
      const check = this.#validator.check(next)
      if (!check.success) continue
      return next
    }
  }

  /** Closes this receiver */
  public close() {
    this.#channel.end()
    MemoryChannels.unregister(this.channel, this.#handle)
  }

  // --------------------------------------------------------
  // Factory
  // --------------------------------------------------------

  public static Create<T extends TSchema>(schema: T, channel: string): PubSubMemoryReceiver<T> {
    return new PubSubMemoryReceiver(schema, channel)
  }
}
