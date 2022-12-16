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

import { createServer as createHttpServer, Server, IncomingMessage } from 'node:http'
import { createServer as createHttpsServer, ServerOptions } from 'node:https'
import { WebSocketServer } from 'ws'
import { RpcSocketService, RpcService, RestService } from '@sidewinder/service'
import { Socket } from 'node:net'
import { v4 } from 'uuid'
import { Application, RequestHandler } from 'express'
import { NodeServiceRequest } from './request'
import { NodeServiceResponse } from './response'
import { NodeServiceSocket } from './socket'
import ws from 'ws'
import express from 'express'

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

export class Host {
  #server!: Server // deferred till listen
  readonly #options: HostOptions
  readonly #wsserver: WebSocketServer
  readonly #application: Application
  readonly #socketServices: Map<string, RpcSocketService<any>>
  readonly #sockets: Map<number, ws.WebSocket>
  readonly #keepAliveInterval: NodeJS.Timer
  #socketOrdinal: number
  #socketCount: number
  #listening: boolean
  #disposed: boolean

  constructor(options: Partial<HostOptions> = {}) {
    this.#options = defaultHostOptions(options)
    this.#socketServices = new Map<string, RpcSocketService<any>>()
    this.#sockets = new Map<number, ws.WebSocket>()
    this.#application = express()
    this.#wsserver = new WebSocketServer({ noServer: true, ...(this.#options.disableFrameCompression ? { perMessageDeflate: false } : {}) })
    this.#keepAliveInterval = setInterval(() => this.#keepAlive(), this.#options.keepAliveTimeout)
    this.#socketOrdinal = 0
    this.#socketCount = 0
    this.#listening = false
    this.#disposed = false
    this.#configureAutoScaling()
  }

  // ------------------------------------------------------------------
  // Use
  // ------------------------------------------------------------------

  public use(path: string, service: RpcSocketService<any, any>): void
  public use(path: string, service: RpcService<any, any>): void
  public use(path: string, service: RestService): void
  public use(path: string, service: RequestHandler): void
  public use(service: RpcSocketService<any, any>): void
  public use(service: RpcService<any, any>): void
  public use(service: RestService): void
  public use(service: RequestHandler): void
  public use(...args: any[]): void {
    this.#assertDisposed()
    if (args.length > 2 || args.length < 1) throw Error('Invalid parameters on use()')
    const [path, service] = args.length === 2 ? [args[0], args[1]] : ['/', args[0]]
    if (service instanceof RpcSocketService) {
      this.#mountWebSocketService(path, service)
    } else if (service instanceof RpcService) {
      this.#mountWebService(path, service)
    } else if (service instanceof RestService) {
      this.#mountRestService(path, service)
    } else {
      this.#mountRequestHandler(path, service)
    }
  }
  // ------------------------------------------------------------------
  // Mounts
  // ------------------------------------------------------------------

  #mountWebSocketService(path: string, service: RpcSocketService<any, any>) {
    this.#socketServices.set(path, service)
  }

  #mountWebService(path: string, service: RpcService<any, any>) {
    this.#application.post(path, (req, res) => service.accept(v4(), new NodeServiceRequest(req), new NodeServiceResponse(res)))
  }

  #mountRestService(path: string, service: RestService) {
    this.#application.use(path, (req, res) => service.accept(v4(), new NodeServiceRequest(req), new NodeServiceResponse(res)))
  }

  #mountRequestHandler(path: string, service: RequestHandler) {
    this.#application.use(path, service)
  }

  // ------------------------------------------------------------------
  // Listen
  // ------------------------------------------------------------------

  /** Listens on the given port and optional hostname */
  public listen(port: number, hostname: string = '0.0.0.0', options: ServerOptions = {}): Promise<void> {
    this.#assertDisposed()
    this.#assertNotListening()
    this.#listening = true
    return new Promise((resolve) => {
      this.#server = createHttpServer(this.#application)
      this.#server.on('upgrade', (request, socket, head) => this.#upgradeWebSocket(request, socket as Socket, head))
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
    this.#assertDisposed()
    this.#assertNotListening()
    this.#listening = true
    return new Promise((resolve) => {
      this.#server = createHttpsServer(options, this.#application)
      this.#server.on('upgrade', (request, socket, head) => this.#upgradeWebSocket(request, socket as Socket, head))
      this.#server.listen(port, hostname, () => resolve())
    })
  }

  // ------------------------------------------------------------------
  // Dispose
  // ------------------------------------------------------------------

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

  async #upgradeWebSocket(request: IncomingMessage, socket: Socket, head: any) {
    if (this.#exceedSocketCount()) {
      socket.destroy()
      return
    }
    const url = new URL(request.url!, 'http://domain.com/')
    if (!this.#socketServices.has(url.pathname!)) {
      socket.destroy()
      return
    }
    try {
      const clientId = v4()
      const service = this.#socketServices.get(url.pathname)!
      const authorized = await service.upgrade(clientId, new NodeServiceRequest(request))
      if (!authorized) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
        socket.destroy()
        return
      }
      this.#wsserver.handleUpgrade(request, socket, head, (socket: ws.WebSocket) => {
        socket.on('close', () => this.#decrementSocketCount())
        this.#incrementSocketCount()
        service.accept(clientId, new NodeServiceSocket(socket))
        this.#sockets.set(this.#nextSocketOrdinal(), socket)
      })
    } catch (error) {
      console.error('[Host] Error upgrading connection: ', error)
      socket.write('HTTP/1.1 500 Internal Server Error\r\n\r\n')
      socket.destroy()
    }
  }

  #configureAutoScaling() {
    if (this.#options.autoScaling === undefined) return
    this.#application.get(this.#options.autoScaling.endpoint, (_, res) => {
      const status = this.#socketCount >= this.#options.autoScaling!.threshold ? 500 : 200
      res.status(status).json({ status })
    })
  }

  #keepAlive() {
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

  #nextSocketOrdinal() {
    return this.#socketOrdinal++
  }

  #incrementSocketCount() {
    this.#socketCount += 1
  }

  #decrementSocketCount() {
    this.#socketCount -= 1
  }

  #exceedSocketCount() {
    return this.#socketCount >= this.#options.maxSocketCount
  }

  #assertNotListening() {
    if (this.#listening) throw Error('Host can only listen once')
  }

  #assertDisposed() {
    if (this.#disposed) throw Error('Host is disposed')
  }
}
