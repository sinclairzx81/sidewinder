/*--------------------------------------------------------------------------

@sidewinder/client

The MIT License (MIT)

Copyright (c) 2022-2024 Haydn Paterson (sinclair) <haydn.developer@gmail.com>

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

import { RetryWebSocket, WebSocket, WebSocketCloseEvent } from '@sidewinder/web'
import { Exception, Static, TContract, ContractMethodParamters, ContractMethodReturnType, TFunction } from '@sidewinder/contract'
import { ClientMethods, Responder, RpcErrorCode, RpcProtocol, RpcRequest, RpcResponse } from './methods/index'
import { Encoder, MsgPackEncoder, JsonEncoder } from './encoder/index'
import { Barrier } from '@sidewinder/async'

export type WebSocketClientConnectCallback = () => void
export type WebSocketClientErrorCallback = (error: any) => void
export type WebSocketClientCloseCallback = (event: WebSocketCloseEvent) => void

function defaultClientOptions(partial: Partial<WebSocketClientOptions>): WebSocketClientOptions {
  const options: WebSocketClientOptions = { autoReconnectEnabled: false, autoReconnectBuffer: false, autoReconnectTimeout: 4000 }
  if (partial.autoReconnectEnabled !== undefined) options.autoReconnectEnabled = partial.autoReconnectEnabled
  if (partial.autoReconnectBuffer !== undefined) options.autoReconnectBuffer = partial.autoReconnectBuffer
  if (partial.autoReconnectTimeout !== undefined) options.autoReconnectTimeout = partial.autoReconnectTimeout
  return options
}

export interface WebSocketClientOptions {
  /**
   * If true, this socket will attempt to automatically reconnect
   * to the remote service if the underlying WebSocket transport
   * closes.
   *
   * (Default is false)
   */
  autoReconnectEnabled: boolean
  /**
   * If true, this socket will buffer any RPC method calls if calls
   * are made while the underlying WebSocket transport is in a
   * disconnected state. This option is only available if the
   * autoReconnectEnabled option is true.
   *
   * (Default is false)
   */
  autoReconnectBuffer: boolean
  /**
   * The auto reconnection timeout. This is the period of time that
   * should elapse before a reconnection attempt is made in instances
   * the underlying WebSocket connection terminates. This option is
   * only available if the autoReconnectEnabled option is true.
   *
   * (Default is 4000)
   */
  autoReconnectTimeout: number
}

function into(callback: Function) {
  callback()
}

/** A JSON RPC 2.0 based WebSocket client used to connect to Sidewinder WebSocketService endpoints. */
export class WebSocketClient<Contract extends TContract> {
  private onConnectCallback: WebSocketClientConnectCallback = () => {}
  private onErrorCallback: WebSocketClientErrorCallback = () => {}
  private onCloseCallback: WebSocketClientCloseCallback = () => {}

  private readonly encoder: Encoder
  private readonly methods: ClientMethods
  private readonly socket: RetryWebSocket | WebSocket
  private readonly options: WebSocketClientOptions
  private readonly responder: Responder
  private readonly barrier: Barrier
  private closed: boolean

  constructor(private readonly contract: Contract, private readonly endpoint: string, options: Partial<WebSocketClientOptions> = {}) {
    this.options = defaultClientOptions(options)
    this.onConnectCallback = () => {}
    this.onErrorCallback = () => {}
    this.onCloseCallback = () => {}
    this.encoder = this.contract.format === 'json' ? new JsonEncoder() : new MsgPackEncoder()
    this.methods = new ClientMethods()
    this.barrier = new Barrier()
    this.responder = new Responder()
    this.socket = this.options.autoReconnectEnabled
      ? new RetryWebSocket(this.endpoint, {
          binaryType: 'arraybuffer',
          autoReconnectBuffer: this.options.autoReconnectBuffer,
          autoReconnectTimeout: this.options.autoReconnectTimeout,
        })
      : new WebSocket(this.endpoint, {
          binaryType: 'arraybuffer',
        })
    this.socket.on('open', () => this.onOpen())
    this.socket.on('message', (event) => this.onMessage(event))
    this.socket.on('error', (event) => this.onError(event))
    this.socket.on('close', (event) => this.onClose(event))
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
      case 'connect': {
        this.onConnectCallback = callback as WebSocketClientConnectCallback
        break
      }
      case 'error': {
        this.onErrorCallback = callback as WebSocketClientErrorCallback
        break
      }
      case 'close': {
        this.onCloseCallback = callback as WebSocketClientCloseCallback
        break
      }
      default:
        throw Error(`Unknown event '${event}'`)
    }
    return callback
  }

  /** Defines a client method implementation */
  public method<
    Method extends keyof Static<Contract>['client'] extends infer R ? (R extends string ? R : never) : never,
    Parameters extends ContractMethodParamters<Static<Contract>['client'][Method]>,
    ReturnType extends ContractMethodReturnType<Static<Contract>['client'][Method]>,
  >(method: Method, callback: (...params: Parameters) => Promise<ReturnType> | ReturnType) {
    const target = (this.contract.client as any)[method] as TFunction | undefined
    if (target === undefined) throw Error(`Cannot define method '${method}' as it does not exist in contract`)
    this.methods.register(method as string, target, callback)
    return async (...params: Parameters): Promise<ReturnType> => await this.methods.execute(method as string, params)
  }

  /** Calls a remote service method */
  public async call<
    Method extends keyof Static<Contract>['server'] extends infer R ? (R extends string ? R : never) : never,
    Parameters extends ContractMethodParamters<Static<Contract>['server'][Method]>,
    ReturnType extends ContractMethodReturnType<Static<Contract>['server'][Method]>,
  >(method: Method, ...params: Parameters): Promise<ReturnType> {
    await this.barrier.wait()
    this.assertMethodExists(method)
    this.assertCanSend()
    const handle = this.responder.register('client')
    const request = RpcProtocol.encodeRequest(handle, method, params)
    const message = this.encoder.encode(request)
    this.socketSendInternal(message).catch((error) => this.responder.reject(handle, error)) // must reject on error (retry socket)
    return await this.responder.wait(handle)
  }

  /** Sends a message to a remote service method and ignores the result */
  public send<Method extends keyof Static<Contract>['server'] extends infer R ? (R extends string ? R : never) : never, Parameters extends ContractMethodParamters<Static<Contract>['server'][Method]>>(
    method: Method,
    ...params: Parameters
  ): void {
    this.assertMethodExists(method as string)
    into(async () => {
      try {
        await this.barrier.wait()
        this.assertCanSend()
        const request = RpcProtocol.encodeRequest(undefined, method as string, params)
        const message = this.encoder.encode(request)
        await this.socketSendInternal(message)
      } catch (error) {
        this.onErrorCallback(error)
      }
    })
  }

  /** Closes this client. */
  public close(code?: number, reason?: string) {
    this.socket.close(code, reason)
  }
  // -------------------------------------------------------------------------------------------
  // Request
  // -------------------------------------------------------------------------------------------

  private async sendResponseWithResult(rpcRequest: RpcRequest, result: unknown) {
    if (rpcRequest.id === undefined || rpcRequest.id === null) return
    const response = RpcProtocol.encodeResult(rpcRequest.id, result)
    const buffer = this.encoder.encode(response)
    await this.socketSendInternal(buffer)
  }

  private async sendResponseWithError(rpcRequest: RpcRequest, error: Error) {
    if (rpcRequest.id === undefined || rpcRequest.id === null) return
    if (error instanceof Exception) {
      const response = RpcProtocol.encodeError(rpcRequest.id, { code: error.code, message: error.message, data: error.data })
      const buffer = this.encoder.encode(response)
      await this.socketSendInternal(buffer)
    } else {
      const code = RpcErrorCode.InternalServerError
      const message = 'Internal Server Error'
      const data = {}
      const response = RpcProtocol.encodeError(rpcRequest.id, { code, message, data })
      const buffer = this.encoder.encode(response)
      await this.socketSendInternal(buffer)
    }
  }

  private async executeRequest(rpcRequest: RpcRequest) {
    try {
      const result = await this.methods.execute(rpcRequest.method, rpcRequest.params)
      await this.sendResponseWithResult(rpcRequest, result)
    } catch (error) {
      await this.sendResponseWithError(rpcRequest, error as Error)
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
  // Socket Send Internal
  // -------------------------------------------------------------------------------------------

  /**
   * Internal Socket Send. This is required as the Retry send is asynchronous, while the
   * standard web socket is synchronous. Note that in the instance the retry socket is
   * called without a retry buffer, this results in an immediate throw. In this scenario,
   * the responder must remove it's handle and reject to the caller.
   */
  private async socketSendInternal(message: unknown) {
    return await this.socket.send(message)
  }

  // -------------------------------------------------------------------------------------------
  // Socket Events
  // -------------------------------------------------------------------------------------------

  private onOpen() {
    this.onConnectCallback()
    this.barrier.resume()
  }

  private async onMessage(event: MessageEvent) {
    try {
      const message = RpcProtocol.decodeAny(this.encoder.decode(event.data as Uint8Array))
      if (message === undefined) return
      if (message.type === 'request') {
        await this.executeRequest(message.data)
      } else if (message.type === 'response') {
        await this.executeResponse(message.data)
      } else {
      }
    } catch (error) {
      this.onErrorCallback(error)
    }
  }

  private onError(event: Event) {
    this.onErrorCallback(event)
  }

  private onClose(event: WebSocketCloseEvent) {
    if (!this.options.autoReconnectEnabled) this.closed = true
    this.responder.rejectFor('client', new Error('Unable to communicate with server'))
    this.onCloseCallback(event)
    this.barrier.resume()
  }

  private assertMethodExists(method: string) {
    if (!Object.keys(this.contract.server).includes(method)) throw new Error(`Method '${method}' not defined in contract`)
  }

  private assertCanSend() {
    if (this.closed) {
      throw new Error('WebSocket has closed')
    }
  }

  private setupNotImplemented() {
    for (const [name, schema] of Object.entries(this.contract.client)) {
      this.methods.register(name, schema as TFunction, () => {
        throw new Exception(`Method '${name}' not implemented`, RpcErrorCode.InternalServerError, {})
      })
    }
  }
}
