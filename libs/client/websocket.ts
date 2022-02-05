/*--------------------------------------------------------------------------

@sidewinder/client

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

import { TContract, ResolveContractMethodParameters, ResolveContractMethodReturnType, TFunction } from '@sidewinder/contract'
import { Methods, Exception, Responder, Encoder, JsonEncoder, MsgPackEncoder, Barrier, RpcErrorCode, RpcProtocol } from '@sidewinder/shared'
import { RetryWebSocket, UnifiedWebSocket } from './sockets'

export type WebSocketClientConnectCallback = () => void
export type WebSocketClientErrorCallback   = (error: any) => void
export type WebSocketClientCloseCallback   = () => void

function defaultClientOptions(partial: Partial<WebSocketClientOptions>): WebSocketClientOptions {
    const options: WebSocketClientOptions = { autoReconnectEnabled: false, autoReconnectBuffer: false, autoReconnectTimeout: 2000 }
    if (partial.autoReconnectEnabled !== undefined) options.autoReconnectEnabled = partial.autoReconnectEnabled
    if (partial.autoReconnectBuffer !== undefined) options.autoReconnectBuffer = partial.autoReconnectBuffer
    if (partial.autoReconnectTimeout !== undefined) options.autoReconnectTimeout = partial.autoReconnectTimeout
    return options
}

export interface WebSocketClientOptions {
    autoReconnectEnabled: boolean
    autoReconnectBuffer: boolean
    autoReconnectTimeout: number
}

export class WebSocketClient<Contract extends TContract> {
    private onConnectCallback: WebSocketClientConnectCallback = () => { }
    private onErrorCallback: WebSocketClientErrorCallback = () => { }
    private onCloseCallback: WebSocketClientCloseCallback = () => { }

    private readonly encoder:   Encoder
    private readonly socket:    RetryWebSocket | UnifiedWebSocket
    private readonly options:   WebSocketClientOptions
    private readonly responder: Responder
    private readonly methods:   Methods
    private readonly barrier:   Barrier
    private closed: boolean

    constructor(private readonly contract: Contract, private readonly endpoint: string, options: Partial<WebSocketClientOptions> = {}) {
        this.options = defaultClientOptions(options)
        this.onConnectCallback = () => { }
        this.onErrorCallback = () => { }
        this.onCloseCallback = () => { }
        this.encoder = this.contract.format === 'json' ? new JsonEncoder() : new MsgPackEncoder()
        this.methods = new Methods()
        this.barrier = new Barrier()
        this.responder = new Responder()
        this.socket = this.options.autoReconnectEnabled
            ? new RetryWebSocket(this.endpoint, {
                binaryType: 'arraybuffer',
                reconnectBuffer: this.options.autoReconnectBuffer,
                reconnectTimeout: this.options.autoReconnectTimeout
            })
            : new UnifiedWebSocket(this.endpoint, {
                binaryType: 'arraybuffer'
            })
        this.socket.on('open', () => this.onOpen())
        this.socket.on('message', event => this.onMessage(event))
        this.socket.on('error', event => this.onError(event))
        this.socket.on('close', () => this.onClose())
        this.closed = false
        this.setupNotImplemented()
    }

    /** Subscribes to socket connect events */
    public event(event: 'connect', callback: WebSocketClientConnectCallback): WebSocketClientConnectCallback
    /** Subscribes to socket error events */
    public event(event: 'error', callback: WebSocketClientErrorCallback): WebSocketClientErrorCallback
    /** Subscribes to socket close events */
    public event(event: 'close', callback: WebSocketClientCloseCallback): WebSocketClientCloseCallback
    /** Subscribes to events */
    public event(event: string, callback: Function): any {
        switch (event) {
            case 'connect': { this.onConnectCallback = callback as WebSocketClientConnectCallback; break }
            case 'error': { this.onErrorCallback = callback as WebSocketClientErrorCallback; break }
            case 'close': { this.onCloseCallback = callback as WebSocketClientCloseCallback; break; }
            default: throw Error(`Unknown event '${event}'`)
        }
        return callback
    }

    /** Defines a method implementation */
    public method<
        Method extends keyof Contract['$static']['client'],
        Parameters extends ResolveContractMethodParameters<Contract['$static']['client'][Method]>,
        ReturnType extends ResolveContractMethodReturnType<Contract['$static']['client'][Method]>
    >(method: Method, callback: (...params: Parameters) => Promise<ReturnType> | ReturnType) {
        this.methods.register(method as string, (this.contract.client as any)[method], (clientId: string) => clientId, callback)
        return async (...params: Parameters): Promise<ReturnType> => {
            return this.methods.executeClientMethod(method as string, params)
        }
    }

    /** Calls a remote method */
    public async call<
        Method extends keyof Contract['$static']['server'],
        Parameters extends ResolveContractMethodParameters<Contract['$static']['server'][Method]>,
        ReturnType extends ResolveContractMethodReturnType<Contract['$static']['server'][Method]>
    >(method: Method, ...params: Parameters): Promise<ReturnType> {
        await this.barrier.wait()
        this.assertCanSend()
        return new Promise((resolve, reject) => {
            const handle  = this.responder.register('client', resolve, reject)
            const request = RpcProtocol.encodeRequest(handle, method as string, params)
            const message = this.encoder.encode(request)
            this.socket.send(message)
        })
    }

    /** Sends a message to a remote method and ignores the result */
    public send<
        Method extends keyof Contract['$static']['server'],
        Parameters extends ResolveContractMethodParameters<Contract['$static']['server'][Method]>,
        >(method: Method, ...params: Parameters): void {
        (async () => {
            try {
                await this.barrier.wait()
                this.assertCanSend()
                const request = RpcProtocol.encodeRequest(undefined, method as string, params)
                const message = this.encoder.encode(request)
                this.socket.send(message)
            } catch(error) {
                this.onErrorCallback(error)
            }
        })()
    }

    private onOpen() {
        this.onConnectCallback()
        this.barrier.resume()
    }

    private async onMessage(event: MessageEvent) {
        try {
            const message = RpcProtocol.decodeAny(this.encoder.decode(event.data as Uint8Array))
            if (message === undefined) return
            if (message.type === 'request') {
                const request = message.data
                const result = await this.methods.executeClientProtocol(request)
                if (result.type === 'result-with-response' || result.type === 'error-with-response') {
                    this.socket.send(this.encoder.encode(result.response))
                }
            } else if (message.type === 'response') {
                const response = message.data
                if (response.result) {
                    this.responder.resolve(response.id, response.result)
                } else if (response.error) {
                    const { message, code, data } = response.error
                    this.responder.reject(response.id, new Exception(message, code, data))
                }
            } else { }
        } catch (error) {
            this.onErrorCallback(error)
        }
    }

    private onError(event: Event) {
        this.onErrorCallback(event)
    }

    private onClose() {
        if (!this.options.autoReconnectEnabled) this.closed = true
        this.responder.rejectFor('client', new Error('Unable to communicate with server'))
        this.onCloseCallback()
        this.barrier.resume()
    }

    public close() {
        this.socket.close()
    }
    private assertCanSend() {
        if (this.closed) throw new Error('WebSocket has closed')
    }

    private setupNotImplemented() {
        for (const [name, schema] of Object.entries(this.contract.client)) {
            this.methods.register(name, schema as TFunction, (clientId: string) => clientId, () => {
                throw new Exception(`Method '${name}' not implemented`, RpcErrorCode.InternalServerError, {})
            })
        }
    }
}
