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

import { createServer, IncomingMessage } from 'http'
import { Application, Router, RequestHandler } from 'express'
import { Socket } from 'net'
import { WebSocketServer } from 'ws'
import { WebSocketService } from './websocket'
import { WebService } from './web'
import express from 'express'
import { v4 } from 'uuid'
import ws from 'ws'

export interface HostOptions {

	/** 
	 * Load balancer keep alive. Transmits a `ping` signal to each connected 
     * web sockets to prevent inactive sockets being terminated by load balancers.
	 * 
	 * (default is 8000) 
	 */
     keepAliveTimeout: number

     /** 
      * Disables client message compression. By default, browsers will compress web 
      * socket frames which the server needs to decompress on a per message basis. 
      * Setting this value to false means the server can skip frame decompression 
      * (reducing CPU overhead) but at the expense of adding IO / Network overhead.
      * 
      * (Default is false)
      */
     disableFrameCompression: boolean
 
     /**
      * Sets an upper limit for the number of concurrent web sockets allowed on this 
      * service. This can be useful for autoscaling scenarios where the AWS ALB will 
      * limited connections to around 4075, but where autoscaling may be dependent on
      * service latency.
      * 
      * (Default is 16384)
      */
     maxSocketCount: number
 
}

export interface UseOptions {
    /** 
     * If true, will publish the services contract on GET requests to the
     * services basePath. This option can be enabled to allow remote systems
     * to introspect the contract implemented by the service. Useful for
     * auto documentation and code generation on remote systems.
     * 
     * (Default is false) 
     */
    publish: boolean
}

export class Host {
    private readonly application: Application
    private readonly services: Map<string, WebSocketService<any>>
    private readonly sockets: Map<number, ws.WebSocket>
    private socketOrdinal: number
    private socketCount: number

    constructor(private readonly options: HostOptions = {
        keepAliveTimeout: 8000,
        disableFrameCompression: false,
        maxSocketCount: 16384
    }) {
        this.services = new Map<string, WebSocketService<any>>()
        this.sockets = new Map<number, ws.WebSocket>()
        this.application = express()
        this.socketOrdinal = 0
        this.socketCount = 0
        this.keepAlive()
    }

    /** Binds the given WebSocketService to the specified path  */
    public use(basePath: string, service: WebSocketService<any>, options?: UseOptions): void
    /** Binds the given WebService to the specified path  */
    public use(basePath: string, service: WebService<any>, options?: UseOptions): void
    /** Binds the given RequestHandler to the specified path  */
    public use(basePath: string, service: RequestHandler): void
    public use(basePath: string, service: RequestHandler | WebSocketService<any> | WebService<any>, options: UseOptions = { publish: false }): void {
        if (service instanceof WebSocketService) {
            if(options.publish) this.application.get(basePath, (req, res) => res.json(service.contract))
            this.services.set(basePath, service)
        } else if(service instanceof WebService) {
            if(options.publish) this.application.get(basePath, (req, res) => res.json(service.contract))
            this.application.post(basePath, (req, res) => service.accept(v4(), req, res))
        } else {
            this.application.use(basePath, service)
        }
    }

    private nextSocketOrdinal() {
        return this.socketOrdinal++
    }

    private incrementSocketCount() {
        this.socketCount += 1
    }

    private decrementSocketCount() {
        this.socketCount -= 1
    }

    private exceedSocketCount() {
        return this.socketCount >= this.options.maxSocketCount
    }

    private async upgrade(wsserver: ws.WebSocketServer, request: IncomingMessage, socket: Socket, head: any) {
        if (this.exceedSocketCount()) {
            socket.destroy()
            return
        }
        const url = new URL(request.url!, 'http://domain.com/')
        if (!this.services.has(url.pathname!)) {
            socket.destroy()
            return
        }
        try {
            const clientId = v4()
            const service = this.services.get(url.pathname)!
            const authorized = await service.authorize(clientId, request)
            if (!authorized) {
                socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
                socket.destroy()
                return
            }
            wsserver.handleUpgrade(request, socket, head, (socket: ws.WebSocket) => {
                socket.on('close', () => this.decrementSocketCount())
                this.incrementSocketCount()
                service.accept(clientId, socket)
                this.sockets.set(this.nextSocketOrdinal(), socket)
            })
        } catch (error) {
            console.error('[Host] Error upgrading connection: ', error)
            socket.write('HTTP/1.1 500 Internal Server Error\r\n\r\n')
            socket.destroy()
        }
    }

    private keepAlive() {
        setTimeout(() => this.keepAlive(), this.options.keepAliveTimeout)
        for (const [ordinal, socket] of this.sockets) {
            socket.ping(void 0, false, error => {
                if (error === undefined || error === null) return
                try { socket.close() } catch { }
                this.sockets.delete(ordinal)
            })
        }
    }

    /** Listens on the given port and optional hostname */
    public listen(port: number, hostname: string = '0.0.0.0'): Promise<void> {
        return new Promise(resolve => {
            const server = createServer(this.application)
            const options = this.options.disableFrameCompression ? ({ perMessageDeflate: false }) : ({})
            const wsserver = new WebSocketServer({ noServer: true, ...options })
            server.on('upgrade', (request, socket, head) => this.upgrade(wsserver, request, socket as Socket, head))
            server.listen(port, hostname, () => resolve())
        })
    }
}
