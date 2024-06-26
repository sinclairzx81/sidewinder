/*--------------------------------------------------------------------------

@sidewinder/redis

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

import { Sender } from '@sidewinder/channel'

export type SenderHandle = number

// -------------------------------------------------------------------------
// MemoryChannel
// -------------------------------------------------------------------------

export class MemoryChannel {
  readonly #senders: Map<SenderHandle, Sender<unknown>>
  readonly #buffer: unknown[]
  #ordinal: SenderHandle
  #index: number
  constructor() {
    this.#senders = new Map<SenderHandle, Sender<unknown>>()
    this.#buffer = []
    this.#ordinal = 0
    this.#index = 0
  }

  public register(sender: Sender<unknown>): SenderHandle {
    const handle = this.#ordinal++
    this.#senders.set(handle, sender)
    this.#flush(sender)
    return handle
  }

  public unregister(handle: SenderHandle): void {
    this.#senders.delete(handle)
  }

  public send(value: unknown) {
    const sender = this.#select()
    if (sender === undefined) {
      this.#buffer.push(value)
    } else {
      sender.send(value)
    }
  }

  #select(): Sender<unknown> | undefined {
    const keys = [...this.#senders.keys()]
    if (keys.length === 0) return
    const index = this.#index % keys.length
    this.#index += 1
    return this.#senders.get(keys[index])
  }

  #flush(sender: Sender<unknown>): void {
    while (this.#buffer.length > 0) {
      const value = this.#buffer.shift()!
      sender.send(value)
    }
  }
}

// -------------------------------------------------------------------------
// MemoryChannels
// -------------------------------------------------------------------------

export namespace MemoryChannels {
  const memoryChannels = new Map<string, MemoryChannel>()
  export function register(channel: string, sender: Sender<unknown>): SenderHandle {
    if (!memoryChannels.has(channel)) memoryChannels.set(channel, new MemoryChannel())
    const memoryChannel = memoryChannels.get(channel)!
    return memoryChannel.register(sender)
  }
  export function unregister(channel: string, handle: SenderHandle): void {
    if (!memoryChannels.has(channel)) return
    const memoryChannel = memoryChannels.get(channel)!
    return memoryChannel.unregister(handle)
  }
  export function send(channel: string, value: unknown) {
    if (!memoryChannels.has(channel)) memoryChannels.set(channel, new MemoryChannel())
    const memoryChannel = memoryChannels.get(channel)!
    memoryChannel.send(value)
  }
}
