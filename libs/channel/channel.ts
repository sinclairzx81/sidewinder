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

import { Queue }                from './queue'
import { KeepAlive }            from './keepalive'
import { Message, MessageType } from './message'
import { Sender }               from './sender'
import { Receiver }             from './receiver'

/** 
 * An unbounded asynchronous channel. Values sent into this channel are buffered
 * with no upper limit with senders unaware of the receivers throughput.
 */
export class Channel<T = any> implements Sender<T>, Receiver<T> {
    private readonly keepAlive: KeepAlive | null
    private readonly queue: Queue<Message<T>>
    private ended: boolean

    /** Creates this channel with the given bound. The default is 1. */
    constructor(private bounds: number = 1, keepAlive: boolean = false) {
        this.keepAlive = keepAlive ? new KeepAlive() : null
        this.queue = new Queue<Message<T>>()
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
        this.queue.enqueue({ type: MessageType.Next, value })
    }

    /** Sends the given error to this channel causing the receiver to throw on next(). If channel has ended no action. */
    public async error(error: Error): Promise<void> {
        if (this.ended) return
        this.ended = true
        this.queue.enqueue({ type: MessageType.Error, error })
        this.queue.enqueue({ type: MessageType.End })
    }

    /** Ends this channel. */
    public async end(): Promise<void> {
        if (this.ended) return
        this.ended = true
        this.queue.enqueue({ type: MessageType.End })
    }

    /** Returns the next value from this channel or null if EOF. */
    public async next(): Promise<T | null> {
        const message = await this.queue.dequeue()
        switch (message.type) {
            case MessageType.Next: return message.value
            case MessageType.Error: throw message.error
            case MessageType.End: {
                this.terminateKeepAlive()
                return null
            }
        }
    }
    
    /** Terminates the keepAlive */
    private terminateKeepAlive() {
        if(this.keepAlive === null) return
        this.keepAlive.dispose()
    }
}