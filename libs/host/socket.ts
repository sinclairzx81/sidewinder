/*--------------------------------------------------------------------------

@sidewinder/host

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
import { CloseEvent, ErrorEvent, MessageEvent, ServiceSocket } from '@sidewinder/service'
import { WebSocket } from 'ws'

export class NodeServiceSocket extends ServiceSocket {
  readonly #socket: WebSocket
  readonly #events: Events
  constructor(socket: WebSocket) {
    super()
    this.#socket = socket
    this.#events = new Events()
  }
  public on(event: 'message', handler: EventHandler<MessageEvent>): EventListener
  public on(event: 'error', handler: EventHandler<ErrorEvent>): EventListener
  public on(event: 'close', handler: EventHandler<CloseEvent>): EventListener
  public on(event: string, handler: EventHandler<any>): EventListener {
    return this.#events.on(event, handler)
  }

  public send(data: Uint8Array): void {
    this.#socket.send(data)
  }

  public close(): void {
    this.#socket.close()
  }
}
