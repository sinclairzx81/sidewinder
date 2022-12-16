/*--------------------------------------------------------------------------

@sidewinder/websocket

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

import type WS from 'ws' // note: required for build dependency check
import { Platform } from '@sidewinder/platform'
import { Events, EventHandler, EventListener } from '@sidewinder/events'

export interface WebSocketOptions {
  binaryType: BinaryType
}

/** A Sidewinder WebSocket is a unified Browser and Node WebSocket that can be used in either environment. */
export class WebSocket {
  readonly #socket: globalThis.WebSocket | WS.WebSocket
  readonly #events: Events
  constructor(
    private readonly endpoint: string,
    private readonly options: WebSocketOptions = {
      binaryType: 'blob',
    },
  ) {
    this.#events = new Events()
    if (Platform.platform() === 'browser') {
      this.#socket = new globalThis.WebSocket(this.endpoint)
      this.#socket.binaryType = this.options.binaryType
      this.#socket.addEventListener('open', () => this.#onOpen())
      this.#socket.addEventListener('message', (event) => this.#onMessage(event))
      this.#socket.addEventListener('error', (event) => this.#onError(event))
      this.#socket.addEventListener('close', () => this.#onClose())
    } else {
      const WebSocket = Platform.dynamicRequire('ws').WebSocket
      this.#socket = new WebSocket(this.endpoint) as WS.WebSocket
      this.#socket.binaryType = this.options.binaryType as any
      this.#socket.addEventListener('open', () => this.#onOpen())
      this.#socket.addEventListener('message', (event) => this.#onMessage(event as any))
      this.#socket.addEventListener('error', (event) => this.#onError(event as any))
      this.#socket.addEventListener('close', () => this.#onClose())
      this.#socket.on('ping', () => this.#onPing())
      this.#socket.on('pong', () => this.#onPong())
    }
  }

  public get binaryType(): BinaryType {
    return this.#socket.binaryType as BinaryType
  }
  public set binaryType(value: BinaryType) {
    this.#socket.binaryType = value
  }

  /** Subscribes to socket open events. */
  public on(event: 'open', func: EventHandler<void>): EventListener
  /** Subscribes to socket ping events. */
  public on(event: 'ping', func: EventHandler<void>): EventListener
  /** Subscribes to socket pong events. */
  public on(event: 'pong', func: EventHandler<void>): EventListener
  /** Subscribes to socket message events. */
  public on(event: 'message', func: EventHandler<any>): EventListener
  /** Subscribes to socket error events. */
  public on(event: 'error', func: EventHandler<any>): EventListener
  /** Subscribes to socket close events. */
  public on(event: 'close', func: EventHandler<void>): EventListener
  public on(event: string, func: EventHandler<any>) {
    return this.#events.on(event, func)
  }

  /** Subscribes once to socket open events. */
  public once(event: 'open', func: EventHandler<void>): EventListener
  /** Subscribes once to socket ping events. */
  public once(event: 'ping', func: EventHandler<void>): EventListener
  /** Subscribes once to socket pong events. */
  public once(event: 'pong', func: EventHandler<void>): EventListener
  /** Subscribes once to socket message events. */
  public once(event: 'message', func: EventHandler<any>): EventListener
  /** Subscribes once to socket error events. */
  public once(event: 'error', func: EventHandler<any>): EventListener
  /** Subscribes once to socket close events. */
  public once(event: 'close', func: EventHandler<void>): EventListener
  public once(event: string, func: EventHandler<any>) {
    return this.#events.once(event, func)
  }
  /** Sends a ping control frame */
  public ping(data?: any, mask?: boolean) {
    if (Platform.platform() === 'browser') return
    const socket = this.#socket as WS.WebSocket
    socket.ping(data, mask)
  }
  /** Sends a pong control frame */
  public pong(data?: any, mask?: boolean) {
    if (Platform.platform() === 'browser') return
    const socket = this.#socket as WS.WebSocket
    socket.pong(data, mask)
  }
  /** Sends a message */
  public send(data: any) {
    this.#socket.send(data)
  }

  /** Closes this socket */
  public close(code?: number) {
    this.#socket.close(code)
  }

  #onOpen() {
    this.#events.send('open', void 0)
  }
  #onMessage(event: MessageEvent) {
    this.#events.send('message', event)
  }
  #onError(event: Event) {
    this.#events.send('error', event)
  }
  #onPing() {
    this.#events.send('ping', void 0)
  }
  #onPong() {
    this.#events.send('pong', void 0)
  }
  #onClose() {
    this.#events.send('close', void 0)
  }
}
