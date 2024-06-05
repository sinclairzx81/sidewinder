/*--------------------------------------------------------------------------

@sidewinder/web

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

import { Events, EventHandler, EventListener } from '@sidewinder/events'
import { Barrier, Delay } from '@sidewinder/async'
import { WebSocket } from './socket'

export interface RetryWebSocketOptions {
  /** The web socket binary type */
  binaryType: BinaryType
  /** Sets the reconnect timeout in the event this socket disconnects. */
  autoReconnectTimeout: number
  /** If true, the socket will buffer messages while in a disconnected state. */
  autoReconnectBuffer: boolean
}

/**
 * RetryWebSocket:
 *
 * This socket manages an internal web socket connection to a remote endpoint. This
 * socket emits the same events as a typical socket, however the `open` and `close`
 * events may raise multiple times. Callers should be mindful of this behavior when
 * applying state on these events.
 */
export class RetryWebSocket {
  private readonly barrier: Barrier
  private readonly events: Events
  private socket: WebSocket | null
  private explicitClosed: boolean

  constructor(
    private readonly endpoint: string,
    private readonly options: RetryWebSocketOptions = {
      binaryType: 'blob',
      autoReconnectTimeout: 2000,
      autoReconnectBuffer: false,
    },
  ) {
    this.barrier = new Barrier()
    this.events = new Events()
    this.explicitClosed = false
    this.socket = null
    this.establish()
  }

  /**
   * Subscribes to the connection 'open' events. This event will raise each time
   * the underlying socket establishes a connection to a remote endpoint.
   */
  public on(event: 'open', func: EventHandler<any>): EventListener

  /**
   * Subscribes to the connection 'message' events. This event will raise each time
   * a message is received on the transport.
   */
  public on(event: 'message', func: EventHandler<any>): EventListener

  /**
   * Subscribes to the connection 'error' events. This event will raise each time
   * an error occurs on the transport. Multiple error events may be raised
   * across multiple connections created during disconnection events.
   */
  public on(event: 'error', func: EventHandler<any>): EventListener

  /**
   * Subscribes to the connection 'close' events. This event will raise each time
   * an underlying transport terminates. Multiple error events may be raised
   * across multiple connections created during disconnection events.
   */
  public on(event: 'close', func: EventHandler<any>): EventListener

  public on(event: string, func: EventHandler<any>): EventListener {
    return this.events.on(event, func)
  }

  /**
   * Subscribes to the connection 'open' events. This event will raise each time
   * the underlying socket establishes a connection to a remote endpoint.
   */
  public once(event: 'open', func: EventHandler<any>): EventListener
  /**
   * Subscribes to the connection 'message' events. This event will raise each time
   * a message is received on the transport.
   */
  public once(event: 'message', func: EventHandler<any>): EventListener
  /**
   * Subscribes to the connection 'error' events. This event will raise each time
   * an error occurs on the transport. Multiple error events may be raised
   * across multiple connections created during disconnection events.
   */
  public once(event: 'error', func: EventHandler<any>): EventListener
  /**
   * Subscribes to the connection 'close' events. This event will raise each time
   * an underlying transport terminates. Multiple error events may be raised
   * across multiple connections created during disconnection events.
   */
  public once(event: 'close', func: EventHandler<any>): EventListener

  public once(event: string, func: EventHandler<any>): EventListener {
    return this.events.once(event, func)
  }

  /**
   * Sends a message to this socket. If the socket has been explicitly
   * closed, or the socket is in a disconnected and at reconnnectBuffer
   * is false, this call will throw.
   */
  public async send(data: unknown) {
    if (this.explicitClosed) {
      throw new Error('Socket has been closed')
    }
    if (this.socket === null && this.options.autoReconnectBuffer === false) {
      throw Error('Socket is not currently connected. Consider setting autoReconnectBuffer to true to buffer messages while disconnected.')
    }
    await this.barrier.wait()
    this.socket!.send(data)
  }

  /** Closes this Web Socket.  */
  public async close(code?: number, reason?: string) {
    this.explicitClosed = true
    if (this.socket) this.socket.close(code, reason)
    this.events.send('close', void 0)
  }

  private async establish() {
    while (true) {
      if (this.explicitClosed) return
      if (this.socket !== null) {
        await Delay.wait(this.options.autoReconnectTimeout)
        continue
      }
      try {
        this.socket = await this.connect()
        this.events.send('open', void 0)
        this.socket.on('message', (event) => {
          this.events.send('message', event)
        })
        this.socket.on('error', (event) => {
          this.events.send('error', event)
        })
        this.socket.on('close', (event) => {
          this.events.send('close', event)
          this.barrier.pause()
          this.socket = null
        })
        this.barrier.resume()
      } catch (error) {
        this.events.send('error', error)
        await Delay.wait(this.options.autoReconnectTimeout)
      }
    }
  }

  private async connect(): Promise<WebSocket> {
    return new Promise<WebSocket>((resolve, reject) => {
      const socket = new WebSocket(this.endpoint)
      socket.binaryType = this.options.binaryType
      socket.once('open', () => resolve(socket))
      socket.once('error', () => {})
      socket.once('close', () => reject(new Error('Socket unexpectedly closed')))
    })
  }
}
