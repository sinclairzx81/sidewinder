/*--------------------------------------------------------------------------

@sidewinder/socket

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

import { Barrier, Events, EventHandler, EventListener, Delay } from '@sidewinder/shared'
import { UnifiedWebSocket } from './socket'

export interface RetryWebSocketOptions {
    /** The web socket binary type */
    binaryType: BinaryType
    /** Sets the reconnect timeout in the event this socket disconnects. */
    reconnectTimeout: number
    /** If true, the socket will buffer messages while in a disconnected state. */
    reconnectBuffer: boolean
}

/** 
 * A retry web socket that will attempt to reconnect in
 * the instance the underlying socket closes. Provides
 * options for reconnection timeout and buffering when in
 * a disconnected state.
 */
export class RetryWebSocket {
    private readonly barrier: Barrier
    private readonly events:  Events
    private socket:           UnifiedWebSocket | null
    private closed:           boolean

    constructor(private readonly endpoint: string, private readonly options: RetryWebSocketOptions = {
        binaryType:        'blob',
        reconnectTimeout: 2000,
        reconnectBuffer:   false
    }) {
        this.barrier          = new Barrier()
        this.events           = new Events()
        this.closed           = false
        this.socket           = null
        this.establish()
    }

    public on(event: 'open',    func: EventHandler<any>): EventListener
    public on(event: 'message', func: EventHandler<any>): EventListener
    public on(event: 'error',   func: EventHandler<any>): EventListener
    public on(event: 'close',   func: EventHandler<any>): EventListener
    public on(event: string,    func: EventHandler<any>): EventListener {
        return this.events.on(event, func)
    }

    public once(event: 'open',    func: EventHandler<any>): EventListener
    public once(event: 'message', func: EventHandler<any>): EventListener
    public once(event: 'error',   func: EventHandler<any>): EventListener
    public once(event: 'close',   func: EventHandler<any>): EventListener
    public once(event: string,    func: EventHandler<any>): EventListener {
        return this.events.once(event, func)
    }

    public async send(data: any) {
        if (this.closed) {
            throw new Error('Socket has been closed')
        }
        if (this.socket === null && this.options.reconnectBuffer === false) {
            throw Error('Socket is not currently connected')
        }
        await this.barrier.wait()
        this.socket!.send(data)
    }

    public async close() {
        this.closed = true
        if (this.socket) this.socket.close()
        this.events.send('close', void 0)
    }

    private async establish() {
        while (true) {
            if (this.closed) return
            if (this.socket !== null) {
                await Delay.run(this.options.reconnectTimeout)
                continue
            }
            try {
                this.socket = await this.connect()
                this.events.send('open', void 0)
                this.socket.on('message', event => {
                    this.events.send('message', event)
                })
                this.socket.on('error', event => { 
                    this.events.send('error', event)
                })
                this.socket.on('close',() => {
                    this.events.send('close', void 0)
                    this.barrier.pause(); 
                    this.socket = null
                })
                this.barrier.resume()
            } catch (error) {
                await Delay.run(this.options.reconnectTimeout)
            }
        }
    }

    private async connect(): Promise<UnifiedWebSocket> {
        return new Promise<UnifiedWebSocket>((resolve, reject) => {
            const socket = new UnifiedWebSocket(this.endpoint)
            socket.binaryType = this.options.binaryType
            socket.once('open',  () => resolve(socket))
            socket.once('error', () => { })
            socket.once('close', () => reject(new Error('Socket unexpectedly closed')))
        })
    }
}
