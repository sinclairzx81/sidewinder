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

import { Exception, Type, TSchema, TString, TContract, TFunction, ResolveContractMethodParameters, ResolveContractMethodReturnType } from '@sidewinder/contract'
import { Encoder, JsonEncoder, MsgPackEncoder } from '@sidewinder/encoder'
import { Responder } from '@sidewinder/async'
import { Validator } from '@sidewinder/validator'
import { ServiceMethods, RpcErrorCode, RpcProtocol, RpcRequest, RpcResponse } from './methods/index'
import { WebSocket, MessageEvent, CloseEvent, ErrorEvent } from 'ws'
import { IncomingMessage } from 'http'

export type WebSocketServiceAuthorizeCallback<Context> = (clientId: string, request: IncomingMessage) => Promise<Context> | Context
export type WebSocketServiceConnectCallback<Context> = (context: Context) => Promise<unknown> | unknown
export type WebSocketServiceCloseCallback<Context> = (context: Context) => Promise<unknown> | unknown
export type WebSocketServiceErrorCallback = (context: string, error: unknown) => Promise<unknown> | unknown


/**
 * A JSON RPC 2.0 based WebSocket service that supports remote method invocation over 
 * RFC6455 compatible WebSockets. This service supports bi-directional method invocation
 * and offers additional functions to enable this service to call remote methods on its 
 * clients.
 */
export class WebSocketService<Contract extends TContract, Context extends TSchema = TString> {
    private onAuthorizeCallback: WebSocketServiceAuthorizeCallback<Context['$static']>
    private onConnectCallback: WebSocketServiceConnectCallback<Context['$static']>
    private onCloseCallback: WebSocketServiceCloseCallback<Context['$static']>
    private onErrorCallback: WebSocketServiceErrorCallback

    private readonly contextValidator: Validator<Context>
    private readonly contexts: Map<string, Context['$static']>
    private readonly sockets: Map<string, WebSocket>
    private readonly encoder: Encoder
    private readonly responder: Responder
    private readonly methods: ServiceMethods

    constructor(private readonly contract: Contract, private readonly context: Context = (Type.String() as any)) {
        this.contextValidator = new Validator(this.context)
        this.onAuthorizeCallback = (clientId: string) => (clientId as unknown)
        this.onConnectCallback = () => { }
        this.onErrorCallback = () => { }
        this.onCloseCallback = () => { }
        this.contexts = new Map<string, Context['$static']>()
        this.sockets = new Map<string, WebSocket>()
        this.encoder = this.contract.format === 'json' ? new JsonEncoder() : new MsgPackEncoder()
        this.responder = new Responder()
        this.methods = new ServiceMethods()
        this.setupNotImplemented()
    }

    /** 
     * Subscribes to authorize events. This event is raised for each connection and is used to
     * reject connections before socket upgrade. Callers should use this event to initialize any
     * associated state for the clientId.
     */
    public event(event: 'authorize', callback: WebSocketServiceAuthorizeCallback<Context['$static']>): WebSocketServiceAuthorizeCallback<Context['$static']>

    /**
     * Subscribes to connect events. This event is called immediately after a successful 'authorize' event.
     * Callers can use this event to transmit any provisional messages to clients, or initialize additional
     * state for the clientId.
     */
    public event(event: 'connect', callback: WebSocketServiceConnectCallback<Context['$static']>): WebSocketServiceConnectCallback<Context['$static']>


    /**
     * Subscribes to close events. This event is raises whenever a socket disconencts from
     * the service. Callers should use this event to delete any state associated with the
     * clientId.
     */
    public event(event: 'close', callback: WebSocketServiceCloseCallback<Context['$static']>): WebSocketServiceCloseCallback<Context['$static']>

    /**
    * Subcribes to error events. This event is typically raised for any socket transport errors. This
    * event is usually triggered immediately before a close event.
    */
    public event(event: 'error', callback: WebSocketServiceErrorCallback): WebSocketServiceErrorCallback

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

    /** Returns an iterator for each clientId currently connected to this service */
    public clients(): IterableIterator<string> {
        return this.sockets.keys()
    }

    /** Defines a server method implementation */
    public method<
        Method extends keyof Contract['$static']['server'] extends infer R ? R extends string ? R : never : never,
        Parameters extends ResolveContractMethodParameters<Contract['$static']['server'][Method]>,
        ReturnType extends ResolveContractMethodReturnType<Contract['$static']['server'][Method]>
    >(
        method: Method,
        callback: (context: Context['$static'], ...params: Parameters) => Promise<ReturnType> | ReturnType
    ): (context: Context['$static'], ...params: Parameters) => Promise<ReturnType> {
        const target = (this.contract.server as any)[method] as TFunction | undefined
        if (target === undefined) throw Error(`Cannot define method '${method}' as it does not exist in contract`)
        this.methods.register(method as string, target, callback)
        return async (context: Context['$static'], ...params: any[]) => await this.methods.execute(context, method, params)
    }

    /** Calls a remote client method */
    public async call<
        Method extends keyof Contract['$static']['client'] extends infer R ? R extends string ? R : never : never,
        Parameters extends ResolveContractMethodParameters<Contract['$static']['client'][Method]>,
        ReturnType extends ResolveContractMethodReturnType<Contract['$static']['client'][Method]>
    >(clientId: string, method: Method, ...params: Parameters): Promise<ReturnType> {
        if (!this.sockets.has(clientId)) throw new Error('ClientId not found')
        const handle = this.responder.register(clientId)
        const socket = this.sockets.get(clientId)!
        const request = RpcProtocol.encodeRequest(handle, method, params)
        const message = this.encoder.encode(request)
        socket.send(message)
        return await this.responder.wait(handle)
    }

    /** Sends a message to a remote client method and ignores the result */
    public send<
        Method extends keyof Contract['$static']['client'] extends infer R ? R extends string ? R : never : never,
        Parameters extends ResolveContractMethodParameters<Contract['$static']['client'][Method]>,
        >(clientId: string, method: Method, ...params: Parameters): void {
        if (!this.sockets.has(clientId)) return
        const socket = this.sockets.get(clientId)!
        const request = RpcProtocol.encodeRequest(undefined, method, params)
        const message = this.encoder.encode(request)
        socket.send(message)
    }

    /** Closes a client */
    public close(clientId: string): void {
        if (!this.sockets.has(clientId)) return
        const socket = this.sockets.get(clientId)!
        socket.close()
    }

    // -------------------------------------------------------------------------------------------
    // Host
    // -------------------------------------------------------------------------------------------

    public async upgrade(clientId: string, request: IncomingMessage): Promise<boolean> {
        try {
            const context = await this.onAuthorizeCallback(clientId, request)
            this.contextValidator.assert(context)
            this.contexts.set(clientId, context)
            return true
        } catch {
            return false
        }
    }


    public async accept(clientId: string, socket: WebSocket) {
        this.sockets.set(clientId, socket)
        socket.binaryType = 'arraybuffer'
        socket.addEventListener('message', event => this.onMessage(clientId, socket, event))
        socket.addEventListener('error', event => this.onError(clientId, event))
        socket.addEventListener('close', event => this.onClose(clientId, event))

        const context = this.resolveContext(clientId)
        await this.onConnectCallback(context)
    }

    // -------------------------------------------------------------------------------------------
    // Request
    // -------------------------------------------------------------------------------------------

    private async sendResponseWithResult(socket: WebSocket, rpcRequest: RpcRequest, result: unknown) {
        if (rpcRequest.id === undefined || rpcRequest.id === null) return
        const response = RpcProtocol.encodeResult(rpcRequest.id, result)
        const buffer = this.encoder.encode(response)
        socket.send(buffer)
    }

    private async sendResponseWithError(socket: WebSocket, rpcRequest: RpcRequest, error: Error) {
        if (rpcRequest.id === undefined || rpcRequest.id === null) return
        if (error instanceof Exception) {
            const response = RpcProtocol.encodeError(rpcRequest.id, { code: error.code, message: error.message, data: error.data })
            const buffer = this.encoder.encode(response)
            socket.send(buffer)
        } else {
            const code = RpcErrorCode.InternalServerError
            const message = 'Internal Server Error'
            const data = {}
            const response = RpcProtocol.encodeError(rpcRequest.id, { code, message, data })
            const buffer = this.encoder.encode(response)
            socket.send(buffer)
        }
    }

    private async executeRequest(clientId: string, socket: WebSocket, rpcRequest: RpcRequest) {
        const context = this.resolveContext(clientId)
        try {
            const result = await this.methods.execute(context, rpcRequest.method, rpcRequest.params)
            await this.sendResponseWithResult(socket, rpcRequest, result)
        } catch (error) {
            await this.sendResponseWithError(socket, rpcRequest, error as Error)
        }
    }

    // -------------------------------------------------------------------------------------------
    // Response
    // -------------------------------------------------------------------------------------------

    private executeResponse(rpcResponse: RpcResponse) {
        if (rpcResponse.result !== undefined) {
            this.responder.resolve(rpcResponse.id, rpcResponse.result)
        } else if (rpcResponse.error) {
            const { message, code, data } = rpcResponse.error
            this.responder.reject(rpcResponse.id, new Exception(message, code, data))
        }
    }

    // -------------------------------------------------------------------------------------------
    // Socket Events
    // -------------------------------------------------------------------------------------------

    private async onMessage(clientId: string, socket: WebSocket, event: MessageEvent) {
        try {
            const message = RpcProtocol.decodeAny(this.encoder.decode(event.data as Uint8Array))
            if (message === undefined) return
            if (message.type === 'request') {
                await this.executeRequest(clientId, socket, message.data)
            } else if (message.type === 'response') {
                await this.executeResponse(message.data)
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
        const context = this.resolveContext(clientId)
        this.contexts.delete(clientId)
        this.sockets.delete(clientId)
        this.onCloseCallback(context)
    }

    // -------------------------------------------------------------------------------------------
    // Utility
    // -------------------------------------------------------------------------------------------
    
    private resolveContext(clientId: string) {
        if(!this.contexts.has(clientId)) throw Error(`Critical: Cannot locate associated context for clientId '${clientId}'`)
        return this.contexts.get(clientId)!
    }

    private setupNotImplemented() {
        for (const [name, schema] of Object.entries(this.contract.server)) {
            this.methods.register(name, schema as TFunction, () => {
                throw new Exception(`Method '${name}' not implemented`, RpcErrorCode.InternalServerError, {})
            })
        }
    }
}


