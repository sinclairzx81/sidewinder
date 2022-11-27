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

// -------------------------------------------------------------------------
// Message<T>
// -------------------------------------------------------------------------

export interface NextMessage<T> {
  type: 'next'
  value: T
}

export interface ErrorMessage {
  type: 'error'
  error: string
}

export interface EndMessage {
  type: 'end'
}

export type Message<T> = NextMessage<T> | ErrorMessage | EndMessage

// -------------------------------------------------------------------------
// Queue<T>
// -------------------------------------------------------------------------

export type QueueCallbackFunction<T> = (message: Message<T>) => any
export type QueueHandle = number

export class Queue<T> {
  readonly #callbacks: Map<QueueHandle, QueueCallbackFunction<T>>
  #ordinal: QueueHandle

  constructor() {
    this.#callbacks = new Map<QueueHandle, QueueCallbackFunction<T>>()
    this.#ordinal = 0
  }

  public register(callback: QueueCallbackFunction<T>): number {
    const handle = this.#ordinal++
    this.#callbacks.set(handle, callback)
    return handle
  }

  public unregister(handle: number) {
    this.#callbacks.delete(handle)
  }

  public send(value: Message<T>) {
    for (const callback of this.#callbacks.values()) {
      callback(value)
    }
  }
}

// -------------------------------------------------------------------------
// Queues
// -------------------------------------------------------------------------

export namespace Queues {
  const queues = new Map<string, Queue<any>>()
  export function register(channel: string, callback: QueueCallbackFunction<any>): QueueHandle {
    if (!queues.has(channel)) queues.set(channel, new Queue())
    const topic = queues.get(channel)!
    return topic.register(callback)
  }
  export function unregister(channel: string, handle: QueueHandle): void {
    if (!queues.has(channel)) return
    const topic = queues.get(channel)!
    return topic.unregister(handle)
  }
  export function send(channel: string, value: any) {
    if (!queues.has(channel)) return
    const topic = queues.get(channel)!
    topic.send(value)
  }
}
