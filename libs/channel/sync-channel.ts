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

import { Deferred } from '@sidewinder/async'
import { SyncSender } from './sync-sender'
import { Receiver } from './receiver'
import { Queue } from './queue'

type Message<T> = NextMessage<T> | ErrorMessage | EndMessage

enum MessageType { Next, Error, End }

interface NextMessage<T> {
    type: MessageType.Next
    value: T
}
interface ErrorMessage {
    type: MessageType.Error
    error: Error
}
interface EndMessage {
    type: MessageType.End
}

/** 
 * An bounded synchronous channel. Values sent into this channel are queued
 * up to the given bound limit with senders able to await until the queue
 * capacity permits additional values.
 */
export class SyncChannel<T = any> implements SyncSender<T>, Receiver<T> {
    private readonly queue: Queue<Message<T>>
    private readonly sends: Deferred<void>[]
    private ended: boolean

    /** Creates this channel with the given bound. The default is 1. */
    constructor(private bounds: number = 1) {
        this.queue = new Queue<Message<T>>()
        this.sends = []
        this.ended = false
    }

    /** Async iterator for this channel */
    public async *[Symbol.asyncIterator]() {
        while (true) {
            const next = await this.next()
            if (next === null) return
            yield next
        }
    }

    /** Returns the number of values buffered in this channel */
    public get bufferedAmount() {
        return this.queue.bufferedAmount
    }

    /** Sends the given value to this channel. If channel has ended no action. */
    public async send(value: T): Promise<void> {
        if(this.ended) return
        await this.waitForQueue()
        this.queue.enqueue({ type: MessageType.Next, value })
    }

    /** Sends the given error to this channel causing the receiver to throw on next(). If channel has ended no action. */
    public async error(error: Error): Promise<void> {
        if (this.ended) return
        this.ended = true
        await this.waitForQueue()
        this.queue.enqueue({ type: MessageType.Error, error })
        this.queue.enqueue({ type: MessageType.End })
    }

    /** Ends this channel. */
    public async end(): Promise<void> {
        if (this.ended) return
        this.ended = true
        await this.waitForQueue()
        this.queue.enqueue({ type: MessageType.End })
    }

    /** Returns the next value from this channel or null if EOF. */
    public async next(): Promise<T | null> {
        const message = await this.queue.dequeue()
        this.releaseQueue()
        switch (message.type) {
            case MessageType.Next: return message.value
            case MessageType.Error: throw message.error
            case MessageType.End: return null
        }
    }

    /** Checks if the buffer is at capacity */
    private atCapacity() {
        return this.queue.bufferedAmount >= this.bounds
    }

    /** Releases one send from the queue. */
    private async releaseQueue() {
        if (!this.atCapacity() && this.sends.length > 0) {
            const send = this.sends.shift()!
            send.resolve()
        }
    }

    /** Waits for the queue to become free */
    private async waitForQueue() {
        if (this.atCapacity()) {
            const deferred = new Deferred<void>()
            this.sends.push(deferred)
            await deferred.promise()
        }
    }
}
