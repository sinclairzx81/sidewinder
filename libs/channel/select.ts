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

import { SyncChannel }  from './sync-channel'
import { Receiver } from './receiver'

type ReceiverValues<T extends readonly Receiver<any>[]> = { 
    [K in keyof T]: T[K] extends Receiver<infer U> ? U : never
}[number]

/** Selects from one or many async iterables and returns a receiver to receive values from each. */
export function Select<I extends readonly Receiver<any>[]>(receivers: [...I]): Receiver<ReceiverValues<I>> {
    async function receive(sender: SyncChannel<any>, iterator: AsyncIterable<any>) {
        for await(const value of iterator) {
            await sender.send(value)
        }
    }

    const channel  = new SyncChannel<any>(1)
    const promises = receivers.map(receiver => receive(channel, receiver))
    Promise.all(promises).then(() => channel.end())
    return channel
}