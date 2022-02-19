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

import { Deferred, Barrier, Delay } from '@sidewinder/async'
import { SyncSender } from './sync-sender'
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
 * An bounded synchronous channel. Values sent into this channel are queued
 * up to the given bound limit with senders able to await until the queue
 * capacity permits additional values.
 */
export class SyncChannel<T = any> implements SyncSender<T>, Receiver<T> {
    private readonly interval: NodeJS.Timer
    private readonly barrier: Barrier
    private readonly queue: Message<T> []
    private readonly recvs: Deferred<Message<T>>[]
    private ended: boolean
    
    /** Creates this channel with the given bound. The default is 1. */
    constructor(private bounds: number = 1) { 
        this.interval = setInterval(() => {}, 60_000)
        this.barrier = new Barrier(false)
        this.queue = []
        this.recvs = []
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
    public get buffered() {
        return this.queue.length
    }

    /** Sends the given value to this channel. If channel has ended no action. */
    public async send(value: T): Promise<void> {
        if(this.ended) return
        await this.enqueueMessage({ type: MessageType.Next, value })
    }
    
    /** Sends the given error to this channel causing the receiver to throw on next(). If channel has ended no action. */
    public async error(error: Error): Promise<void> {
        if(this.ended) return
        await this.enqueueMessage({ type: MessageType.Error, error })
    }

    /** Ends this channel. */
    public async end(): Promise<void> {
        if(this.ended) return
        this.ended = true
        await this.enqueueMessage({ type: MessageType.End })
    }
    
    /** Returns the next value from this channel or null if EOF. */
    public async next(): Promise<T | null> {
        if(this.queue.length > 0) {
            return await this.dequeueMessage(this.queue.shift()!)
        } else {
            const recv = new Deferred<Message<T>>()
            this.recvs.push(recv)
            return await this.dequeueMessage(await recv.promise())
        }
    }

    private async enqueueMessage(message: Message<T>) {
        await this.barrier.wait()
        if(this.recvs.length > 0) {
            const recv = this.recvs.shift()!
            recv.resolve(message)
        } else {
            this.queue.push(message)
        }
        if(this.atCapacity()) {
            this.barrier.pause()
        }
    }

    private async dequeueMessage(message: Message<T>) {
        if(!this.atCapacity()) this.barrier.resume()
        if(message.type === MessageType.Next) {
            return Promise.resolve(message.value)
        } else if(message.type === MessageType.Error) {
            return Promise.reject(message.error)
        } else {
            clearInterval(this.interval)
            return Promise.resolve(null)
        }
    }



    private atCapacity() { 
        return (this.queue.length >= this.bounds)  
    }
}
