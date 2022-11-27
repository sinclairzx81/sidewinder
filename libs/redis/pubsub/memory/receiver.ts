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
import { Channel } from '@sidewinder/channel'
import { Validator } from '@sidewinder/validator'
import { PubSubTopics } from './topics'
import { PubSubReceiver } from '../receiver'

export class MemoryPubSubReceiver<T extends TSchema> implements PubSubReceiver<Static<T>> {
  readonly #validator: Validator<T>
  readonly #channel: Channel<Static<T>>
  readonly #handle: number
  constructor(private readonly schema: T, private readonly topic: string) {
    this.#validator = new Validator(this.schema)
    this.#channel = new Channel()
    this.#handle = PubSubTopics.register(this.topic, (value) => this.#onMessage(value))
  }

  /** Async iterator for this subscriber */
  public async *[Symbol.asyncIterator](): AsyncIterableIterator<Static<T>> {
    while (true) {
      const next = await this.next()
      if (next === null) return
      yield next
    }
  }

  /** Awaits the next message from this subscriber. */
  public async next(): Promise<Static<T> | null> {
    const next = await this.#channel.next()
    if (next === null) return null
    return next
  }

  /** Disposes of this subscriber. */
  public dispose(): void {
    PubSubTopics.unregister(this.topic, this.#handle)
    this.#channel.end()
  }

  #onMessage(value: Static<T>) {
    const result = this.#validator.check(value)
    if (!result.success) return
    this.#channel.send(value)
  }
}
