/*--------------------------------------------------------------------------

@sidewinder/server

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

import { createServer as createHttpServer, Server, IncomingMessage } from 'http'
import { createServer as createHttpsServer, ServerOptions } from 'https'
import { Application, RequestHandler } from 'express'
import { Socket } from 'net'
import { WebSocketServer } from 'ws'
import { HttpService } from './http/index'
import { WebSocketService, WebService } from './rpc/index'
import express from 'express'
import { v4 } from 'uuid'
import ws from 'ws'

export interface AutoScalingOptions {
  /**
   * Sets an http GET endpoint that can be inspected by an auto scaling process. This endpoint
   * will return a response indicating if this host is oversaturated as indicated by the
   * this threshold property. If connections exceed the configured threshold this endpoint
   * will respond with status 500, otherwise 200.
   */
  endpoint: string

  /**
   * The maximum number of connections before the auto scaling endpoint begins returning
   * 500 status response codes. This is only used if `healthEnabled` is set to true.
   */
  threshold: number
}

export interface HostOptions {
  /**
   * Sends a `ping` signal to each connected socket to prevent inactive sockets being terminated by a load balancer.
   *
   * (Default is 8000)
   */
  keepAliveTimeout: number

  /**
   * Disables client message compression.
   *
   * (Default is false)
   */
  disableFrameCompression: boolean

  /**
   * Sets the maximum number of concurrent Web Sockets able to connect to this Host.
   *
   * (Default is 16384)
   */
  maxSocketCount: number

  /**
   * Configuration options for auto scaling web processes in load balanced in environments.
   *
   * (Default is undefined)
   */
  autoScaling?: AutoScalingOptions
}

function defaultHostOptions(options: Partial<HostOptions>): HostOptions {
  return {
    keepAliveTimeout: options.keepAliveTimeout !== undefined ? options.keepAliveTimeout : 8000,
    disableFrameCompression: options.disableFrameCompression !== undefined ? options.disableFrameCompression : false,
    maxSocketCount: options.maxSocketCount !== undefined ? options.maxSocketCount : 16384,
    autoScaling: options.autoScaling !== undefined ? options.autoScaling : undefined,
  }
}

/**
 * A Host is a network service mount. It handles the details of listening
 * to network interfaces and allows multiple WebService, WebSocketService
 * and Express middleware to be mounted as services.
 */
export class Host {
  #server!: Server // deferred till listen
  readonly #options: HostOptions
  readonly #wsserver: WebSocketServer
  readonly #application: Application
  readonly #services: Map<string, WebSocketService<any>>
  readonly #sockets: Map<number, ws.WebSocket>
  readonly #keepAliveInterval: NodeJS.Timer
  #socketOrdinal: number
  #socketCount: number
  #listening: boolean
  #disposed: boolean

  constructor(options: Partial<HostOptions> = {}) {
    this.#options = defaultHostOptions(options)
    this.#services = new Map<string, WebSocketService<any>>()
    this.#sockets = new Map<number, ws.WebSocket>()
    this.#application = express()
    this.#wsserver = new WebSocketServer({ noServer: true, ...(this.#options.disableFrameCompression ? { perMessageDeflate: false } : {}) })
    this.#keepAliveInterval = setInterval(() => this.keepAlive(), options.keepAliveTimeout)
    this.#socketOrdinal = 0
    this.#socketCount = 0
    this.#listening = false
    this.#disposed = false
    this.configureAutoScaling()
  }

  /** Uses a WebSocketService to the specified path  */
  public use(path: string, service: WebSocketService<any, any>): void

  /** Uses a WebService to the specified path  */
  public use(path: string, service: WebService<any, any>): void

  /** Uses a HttpService to the specified path  */
  public use(path: string, service: HttpService): void

  /** Uses express middleware on the specified path  */
  public use(path: string, service: RequestHandler): void

  /** Uses a WebSocketService  */
  public use(service: WebSocketService<any, any>): void

  /** Uses a WebService */
  public use(service: WebService<any, any>): void

  /** Uses a HttpService */
  public use(service: HttpService): void

  /** Uses express middleware */
  public use(middleware: RequestHandler): void

  /** Uses a service */
  public use(...args: any[]): void {
    this.assertDisposed()
    if (args.length > 2 || args.length < 1) throw Error('Invalid parameters on use()')
    const [path, service] = args.length === 2 ? [args[0], args[1]] : ['/', args[0]]
    if (service instanceof WebSocketService) {
      this.#services.set(path, service)
    } else if (service instanceof WebService) {
      this.#application.post(path, (req, res) => service.accept(v4(), req, res))
    } else if (service instanceof HttpService) {
      this.#application.use(path, (req, res) => service.accept(v4(), req, res))
    } else {
      this.#application.use(path, service)
    }
  }

  /** Listens on the given port and optional hostname */
  public listen(port: number, hostname: string = '0.0.0.0', options: ServerOptions = {}): Promise<void> {
    this.assertDisposed()
    this.assertNotListening()
    this.#listening = true
    return new Promise((resolve) => {
      this.#server = createHttpServer(this.#application)
      this.#server.on('upgrade', (request, socket, head) => this.upgrade(request, socket as Socket, head))
      // Node v18.4.0: https://github.com/nodejs/node/issues/43908
      if (hostname === '0.0.0.0') {
        this.#server.listen(port, () => resolve())
      } else {
        this.#server.listen(port, hostname, () => resolve())
      }
    })
  }

  /** Listens on the given port and optional hostname. Requires key and cert properties to passed as options. */
  public listenTls(port: number, hostname: string = '0.0.0.0', options: ServerOptions = {}): Promise<void> {
    this.assertDisposed()
    this.assertNotListening()
    this.#listening = true
    return new Promise((resolve) => {
      this.#server = createHttpsServer(options, this.#application)
      this.#server.on('upgrade', (request, socket, head) => this.upgrade(request, socket as Socket, head))
      this.#server.listen(port, hostname, () => resolve())
    })
  }

  /** Disposes this host and terminates all connections */
  public async dispose(): Promise<void> {
    if (this.#disposed) return
    this.#disposed = true
    return new Promise((resolve, reject) => {
      clearInterval(this.#keepAliveInterval)
      for (const [socketId, socket] of this.#sockets) {
        this.#sockets.delete(socketId)
        socket.close()
      }
      this.#wsserver.close((error) => {
        if (error) return reject(error)
        if (!this.#server) return resolve()
        this.#server.close((error) => {
          if (error) return reject(error)
          resolve()
        })
      })
    })
  }

  private async upgrade(request: IncomingMessage, socket: Socket, head: any) {
    if (this.exceedSocketCount()) {
      socket.destroy()
      return
    }
    const url = new URL(request.url!, 'http://domain.com/')
    if (!this.#services.has(url.pathname!)) {
      socket.destroy()
      return
    }
    try {
      const clientId = v4()
      const service = this.#services.get(url.pathname)!
      const authorized = await service.upgrade(clientId, request)
      if (!authorized) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
        socket.destroy()
        return
      }
      this.#wsserver.handleUpgrade(request, socket, head, (socket: ws.WebSocket) => {
        socket.on('close', () => this.decrementSocketCount())
        this.incrementSocketCount()
        service.accept(clientId, socket)
        this.#sockets.set(this.nextSocketOrdinal(), socket)
      })
    } catch (error) {
      console.error('[Host] Error upgrading connection: ', error)
      socket.write('HTTP/1.1 500 Internal Server Error\r\n\r\n')
      socket.destroy()
    }
  }

  private configureAutoScaling() {
    if (this.#options.autoScaling === undefined) return
    this.#application.get(this.#options.autoScaling.endpoint, (_, res) => {
      const status = this.#socketCount >= this.#options.autoScaling!.threshold ? 500 : 200
      res.status(status).json({ status })
    })
  }

  private keepAlive() {
    for (const [ordinal, socket] of this.#sockets) {
      socket.ping(void 0, false, (error) => {
        if (error === undefined || error === null) return
        try {
          socket.close()
        } catch {}
        this.#sockets.delete(ordinal)
      })
    }
  }

  private nextSocketOrdinal() {
    return this.#socketOrdinal++
  }

  private incrementSocketCount() {
    this.#socketCount += 1
  }

  private decrementSocketCount() {
    this.#socketCount -= 1
  }

  private exceedSocketCount() {
    return this.#socketCount >= this.#options.maxSocketCount
  }

  private assertNotListening() {
    if (this.#listening) throw Error('Host can only listen once')
  }

  private assertDisposed() {
    if (this.#disposed) throw Error('Host is disposed')
  }
}
