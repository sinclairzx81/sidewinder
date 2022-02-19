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

import { Queue } from './queue'
import { Sender } from './sender'
import { Receiver } from './receiver'

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
 * An unbounded asynchronous channel. Values sent into this channel are buffered
 * with no upper limit with senders unaware of the receivers throughput.
 */
export class Channel<T = any> implements Sender<T>, Receiver<T> {
    private readonly queue: Queue<Message<T>>
    private ended: boolean

    constructor() {
        this.queue = new Queue<Message<T>>()
        this.ended = false
    }

    /** Async iterator for this channel */
    public async *[Symbol.asyncIterator]() {
        while (true) {
            const next = await this.next()
            if (next === null) break
            yield next
        }
    }
    /** Returns the next value from this channel or null if EOF. */
    public async next(): Promise<T | null> {
        if (this.ended) {
            const kind = MessageType.End
            this.queue.enqueue({ type: kind })
        }
        const next = await this.queue.dequeue()
        switch (next.type) {
            case MessageType.Next:
                return next.value
            case MessageType.Error:
                throw next.error
            case MessageType.End:
                return null
        }
    }

    /** Sends the given value to this channel. If channel has ended no action. */
    public send(value: T) {
        if (this.ended) return
        const kind = MessageType.Next
        this.queue.enqueue({ type: kind, value })
    }

    /** Sends the given error to this channel causing the receiver to throw on next(). If channel has ended no action. */
    public error(error: Error) {
        if (this.ended) return
        const kind = MessageType.Error
        this.queue.enqueue({ type: kind, error })
        this.end()
    }

    /** Ends this channel. */
    public end() {
        if (this.ended) return
        const kind = MessageType.End
        this.queue.enqueue({ type: kind })
        this.ended = true
    }
}

const channel = new Channel()

const x = channel[Symbol.asyncIterator]