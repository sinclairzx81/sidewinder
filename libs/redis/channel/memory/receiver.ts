/*--------------------------------------------------------------------------

@sidewinder/channel

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
import { Channel, Receiver } from '@sidewinder/channel'
import { Validator } from '@sidewinder/validator'
import { Queues, Message, NextMessage, ErrorMessage, EndMessage } from './queue'

export class MemoryReceiverError extends Error {
  constructor(message: string) {
    super(`MemoryReceiver: ${message}`)
  }
}

export class MemoryReceiver<T extends TSchema> implements Receiver<Static<T>> {
  readonly #validator: Validator<T>
  readonly #channel: Channel<Static<T>>
  constructor(private readonly schema: T, private readonly channel: string) {
    Queues.register(this.channel, (message) => this.#onMessage(message))
    this.#validator = new Validator(this.schema)
    this.#channel = new Channel()
  }

  public async *[Symbol.asyncIterator]() {
    while (true) {
      const next = await this.next()
      if (next === null) return
      yield next
    }
  }

  public async next(): Promise<Static<T, []> | null> {
    return await this.#channel.next()
  }

  #onNext(message: NextMessage<unknown>) {
    const check = this.#validator.check(message.value)
    if (!check.success) return
    this.#channel.send(message.value)
  }

  #onError(message: ErrorMessage) {
    this.#channel.error(new MemoryReceiverError(message.error))
  }

  #onEnd(message: EndMessage) {
    this.#channel.end()
  }

  #onMessage(message: Message<unknown>) {
    switch (message.type) {
      case 'next':
        return this.#onNext(message)
      case 'error':
        return this.#onError(message)
      case 'end':
        return this.#onEnd(message)
    }
  }
}
