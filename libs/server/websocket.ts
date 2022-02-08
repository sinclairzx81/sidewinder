/*--------------------------------------------------------------------------

@sidewinder/server

The MIT License (MIT)

Copyright (c) 2022 Haydn Paterson (sinclair) <haydn.developer@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the 'Software'), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---------------------------------------------------------------------------*/

import { TContract, ContextMapping, ResolveContextMapping, ResolveContractMethodParameters, ResolveContractMethodReturnType, TFunction } from '@sidewinder/contract'
import { Responder, Encoder, JsonEncoder, MsgPackEncoder } from '@sidewinder/shared'
import { ServerMethods, Exception, RpcErrorCode, RpcProtocol } from './methods/index'
import { WebSocket, MessageEvent, CloseEvent, ErrorEvent } from 'ws'
import { IncomingMessage } from 'http'


export type WebSocketServiceAuthorizeCallback = (clientId: string, request: IncomingMessage) => Promise<boolean> | boolean
export type WebSocketServiceConnectCallback = (clientId: string) => Promise<void> | void
export type WebSocketServiceErrorCallback = (clientId: string, error: unknown) => Promise<void> | void
export type WebSocketServiceCloseCallback = (clientId: string) => Promise<void> | void

export class WebSocketService<Contract extends TContract> {
    private onAuthorizeCallback: WebSocketServiceAuthorizeCallback
    private onConnectCallback: WebSocketServiceConnectCallback
    private onErrorCallback: WebSocketServiceErrorCallback
    private onCloseCallback: WebSocketServiceCloseCallback

    private readonly sockets: Map<string, WebSocket>
    private readonly encoder: Encoder
    private readonly responder: Responder
    private readonly methods: ServerMethods

    constructor(public readonly contract: Contract) {
        this.onAuthorizeCallback = () => true
        this.onConnectCallback = () => { }
        this.onErrorCallback = () => { }
        this.onCloseCallback = () => { }
        this.sockets = new Map<string, WebSocket>()
        this.encoder = this.contract.format === 'json' ? new JsonEncoder() : new MsgPackEncoder()
        this.responder = new Responder()
        this.methods = new ServerMethods()
        this.setupNotImplemented()
    }

    /** 
     * Subscribes to authorize events. This event is raised for each connection and is used to
     * reject connections before socket upgrade. Callers should use this event to initialize any
     * associated state for the clientId.
     */
    public event(event: 'authorize', callback: WebSocketServiceAuthorizeCallback): WebSocketServiceAuthorizeCallback
    
    /**
     * Subscribes to connect events. This event is called immediately after a successful 'authorize' event.
     * Callers can use this event to transmit any provisional messages to clients, or initialize additional
     * state for the clientId.
     */
    public event(event: 'connect', callback: WebSocketServiceConnectCallback): WebSocketServiceConnectCallback
    
    /**
     * Subcribes to error events. This event is typically raised for any socket transport errors. This
     * event is usually triggered immediately before a close event.
     */
    public event(event: 'error', callback: WebSocketServiceErrorCallback): WebSocketServiceErrorCallback
    
    /**
     * Subscribes to close events. This event is raises whenever a socket disconencts from
     * the service. Callers should use this event to delete any state associated with the
     * clientId.
     */
    public event(event: 'close', callback: WebSocketServiceCloseCallback): WebSocketServiceCloseCallback
    public event(event: string, callback: (...args: any[]) => any): any {
        switch (event) {
            case 'authorize': { this.onAuthorizeCallback = callback; break }
            case 'connect': { this.onConnectCallback = callback; break }
            case 'error': { this.onErrorCallback = callback; break }
            case 'close': { this.onCloseCallback = callback; break }
            default: throw Error(`Unknown event '${event}'`)
        }
        return callback
    }

    /** Returns an iterator for this services clients */
    public clients(): IterableIterator<string> {
        return this.sockets.keys()
    }

    /** Defines an method implementation */
    public method<
        Method extends keyof Contract['$static']['server'],
        Parameters extends ResolveContractMethodParameters<Contract['$static']['server'][Method]>,
        ReturnType extends ResolveContractMethodReturnType<Contract['$static']['server'][Method]>,
        Mapping extends ContextMapping<any>
    >(
        method: Method,
        mapping: Mapping,
        callback: (context: ResolveContextMapping<Mapping>, ...params: Parameters) => Promise<ReturnType> | ReturnType
    ): (clientId: string, ...params: Parameters) => Promise<ReturnType>

    /** Defines a method implementation */
    public method<
        Method extends keyof Contract['$static']['server'],
        Parameters extends ResolveContractMethodParameters<Contract['$static']['server'][Method]>,
        ReturnType extends ResolveContractMethodReturnType<Contract['$static']['server'][Method]>
    >(
        method: Method,
        callback: (clientId: string, ...params: Parameters) => Promise<ReturnType> | ReturnType
    ): (clientId: string, ...params: Parameters) => Promise<ReturnType>

    /** Defines an method implementation */
    public method(...args: any[]): any {
        const [method, mapping, callback] = (args.length === 3) ? [args[0], args[1], args[2]] : [args[0], (x: any) => x, args[1]]
        if((this.contract.server as any)[method] === undefined) throw Error(`Cannot define method '${method}' as it does not exist in contract`)
        this.methods.register(method, (this.contract.server as any)[method], mapping, callback)
        return async (clientId: string, ...params: any[]) => await this.methods.executeServerMethod(clientId, method, params)
    }

    /** Calls a remote method */
    public async call<
        Method extends keyof Contract['$static']['client'],
        Parameters extends ResolveContractMethodParameters<Contract['$static']['client'][Method]>,
        ReturnType extends ResolveContractMethodReturnType<Contract['$static']['client'][Method]>
    >(clientId: string, method: Method, ...params: Parameters): Promise<ReturnType> {
        if (!this.sockets.has(clientId)) throw new Error('ClientId not found')
        const handle = this.responder.register(clientId)
        const socket = this.sockets.get(clientId)!
        const request = RpcProtocol.encodeRequest(handle, method as string, params)
        const message = this.encoder.encode(request)
        socket.send(message)
        return await this.responder.wait(handle)
    }
    
    /** Sends a message to a remote method and ignores the result */
    public send<
        Method extends keyof Contract['$static']['client'],
        Parameters extends ResolveContractMethodParameters<Contract['$static']['client'][Method]>,
        >(clientId: string, method: Method, ...params: Parameters): void {
        if (!this.sockets.has(clientId)) return
        const socket = this.sockets.get(clientId)!
        const request = RpcProtocol.encodeRequest(undefined, method as string, params)
        const message = this.encoder.encode(request)
        socket.send(message)
    }

    /** Closes a client */
    public close(clientId: string): void {
        if (!this.sockets.has(clientId)) return
        const socket = this.sockets.get(clientId)!
        socket.close()
    }

    /** HOST FUNCTION: This function is called from the Host to authorize connections on the service.  */
    public async authorize(clientId: string, request: IncomingMessage): Promise<boolean> {
        return await this.onAuthorizeCallback(clientId, request)
    }

    /** HOST FUNCTION: This function is called from the Host to accept upgraded sockets.  */
    public async accept(clientId: string, socket: WebSocket) {
        this.sockets.set(clientId, socket)
        socket.binaryType = 'arraybuffer'
        socket.addEventListener('message', event => this.onMessage(clientId, socket, event))
        socket.addEventListener('error', event => this.onError(clientId, event))
        socket.addEventListener('close', event => this.onClose(clientId, event))
        await this.onConnectCallback(clientId)
    }

    private async onMessage(clientId: string, socket: WebSocket, event: MessageEvent) {
        try {
            const message = RpcProtocol.decodeAny(this.encoder.decode(event.data as Uint8Array))
            if (message === undefined) return
            if (message.type === 'request') {
                const request = message.data
                const result = await this.methods.executeServerProtocol(clientId, request)
                if (result.type === 'result-with-response' || result.type === 'error-with-response') {
                    socket.send(this.encoder.encode(result.response))
                }
            } else if (message.type === 'response') {
                const response = message.data
                if (response.result !== undefined) {
                    this.responder.resolve(response.id, response.result)
                } else if (response.error) {
                    const { message, code, data } = response.error
                    this.responder.reject(response.id, new Exception(message, code, data))
                }
            } else { }
        } catch (error) {
            this.onErrorCallback(clientId, error)
        }
    }

    private onError(clientId: string, event: ErrorEvent) {
        this.onErrorCallback(clientId, event)
    }

    private onClose(clientId: string, event: CloseEvent) {
        this.responder.rejectFor(clientId, new Error('Client disconnected'))
        this.sockets.delete(clientId)
        this.onCloseCallback(clientId)
    }

    private setupNotImplemented() {
        for (const [name, schema] of Object.entries(this.contract.server)) {
            this.methods.register(name, schema as TFunction, (clientId: string) => clientId, () => {
                throw new Exception(`Method '${name}' not implemented`, RpcErrorCode.InternalServerError, {})
            })
        }
    }
}


