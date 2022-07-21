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

import type { MessageEvent, CloseEvent, ErrorEvent } from 'ws'
import type { IncomingMessage } from 'http'

import { TypeCompiler, TypeCheck } from '@sidewinder/type/compiler'
import * as Types from '@sidewinder/contract'
import * as Methods from './methods/index'
import * as Encoding from './encoding/index'
import { Request } from './request'

export type WebSocketServiceAuthorizeCallback<Context> = (clientId: string, request: Request) => Promise<Context> | Context
export type WebSocketServiceConnectCallback<Context> = (context: Context) => Promise<unknown> | unknown
export type WebSocketServiceCloseCallback<Context> = (context: Context) => Promise<unknown> | unknown
export type WebSocketServiceErrorCallback = (context: string, error: unknown) => Promise<unknown> | unknown

/**
 * A JSON RPC 2.0 based WebSocket service that supports remote method invocation over
 * RFC6455 compatible WebSockets. This service supports bi-directional method invocation
 * and offers additional functions to enable this service to call remote methods on its
 * clients.
 */
export class WebSocketService<Contract extends Types.TContract, Context extends Types.TSchema = Types.TString> {
  #onAuthorizeCallback: WebSocketServiceAuthorizeCallback<Types.Static<Context>>
  #onConnectCallback: WebSocketServiceConnectCallback<Types.Static<Context>>
  #onCloseCallback: WebSocketServiceCloseCallback<Types.Static<Context>>
  #onErrorCallback: WebSocketServiceErrorCallback

  readonly #contextTypeCheck: TypeCheck<Context>
  readonly #contexts: Map<string, Types.Static<Context>>
  readonly #sockets: Map<string, WebSocket>
  readonly #encoder: Encoding.Encoder
  readonly #responder: Methods.Responder
  readonly #methods: Methods.ServiceMethods

  /**
   * Creates a new WebSocketService
   * @param contract The contract this service should use.
   * @param context The context this service should use.
   */
  constructor(private readonly contract: Contract, private readonly context: Context = Types.Type.String() as any) {
    this.#contextTypeCheck = TypeCompiler.Compile(this.context)
    this.#onAuthorizeCallback = (clientId: string) => clientId as any
    this.#onConnectCallback = () => {}
    this.#onErrorCallback = () => {}
    this.#onCloseCallback = () => {}
    this.#contexts = new Map<string, Types.Static<Context>>()
    this.#sockets = new Map<string, WebSocket>()
    this.#encoder = this.contract.format === 'json' ? new Encoding.JsonEncoder() : new Encoding.MsgPackEncoder()
    this.#responder = new Methods.Responder()
    this.#methods = new Methods.ServiceMethods()
    this.#setupNotImplemented()
  }

  /**
   * Subscribes to authorize events. This event is raised once for each incoming WebSocket request. Subscribing to
   * this event is mandatory if the service provides a context schema. The authorize event must return a value
   * that conforms to the services context or throw if the user is not authorized. This context is reused for
   * subsequence calls on this service.
   */
  public event(event: 'authorize', callback: WebSocketServiceAuthorizeCallback<Types.Static<Context>>): WebSocketServiceAuthorizeCallback<Types.Static<Context>>

  /**
   * Subscribes to connect events. This event is raised immediately following a successful 'authorize' event only.
   * This event receives the context returned from a successful authorization.
   */
  public event(event: 'connect', callback: WebSocketServiceConnectCallback<Types.Static<Context>>): WebSocketServiceConnectCallback<Types.Static<Context>>

  /**
   * Subscribes to close events. This event is raised whenever the remote WebSocket disconnects from the service.
   * Callers should use this event to clean up any associated state created for the connection. This event receives
   * the context returned from a successful authorization.
   */
  public event(event: 'close', callback: WebSocketServiceCloseCallback<Types.Static<Context>>): WebSocketServiceCloseCallback<Types.Static<Context>>

  /**
   * Subcribes to error events. This event is raised for any socket transport errors and is usually following
   * immediately by a close event. This event receives the initial clientId string value only.
   */
  public event(event: 'error', callback: WebSocketServiceErrorCallback): WebSocketServiceErrorCallback

  public event(event: string, callback: (...args: any[]) => any): any {
    switch (event) {
      case 'authorize': {
        this.#onAuthorizeCallback = callback
        break
      }
      case 'connect': {
        this.#onConnectCallback = callback
        break
      }
      case 'error': {
        this.#onErrorCallback = callback
        break
      }
      case 'close': {
        this.#onCloseCallback = callback
        break
      }
      default:
        throw Error(`Unknown event '${event}'`)
    }
    return callback
  }

  /** Returns an iterator for each clientId currently connected to this service */
  public clients(): IterableIterator<string> {
    return this.#sockets.keys()
  }

  /** Defines a server method implementation with method level authorization */
  public method<
    Method extends keyof Types.Static<Contract>['server'] extends infer R ? (R extends string ? R : never) : never,
    Parameters extends Types.ContractMethodParamters<Types.Static<Contract>['server'][Method]>,
    ReturnType extends Types.ContractMethodReturnType<Types.Static<Contract>['server'][Method]>,
    Authorize extends Types.AuthorizeFunction<Types.Static<Context>, any>,
  >(
    method: Method,
    authorize: Authorize,
    callback: (context: Types.AuthorizeFunctionReturnType<Authorize>, ...params: Parameters) => Promise<ReturnType> | ReturnType,
  ): (context: Types.Static<Context>, ...params: Parameters) => Promise<ReturnType>

  /** Defines a server method implementation */
  public method<
    Method extends keyof Types.Static<Contract>['server'] extends infer R ? (R extends string ? R : never) : never,
    Parameters extends Types.ContractMethodParamters<Types.Static<Contract>['server'][Method]>,
    ReturnType extends Types.ContractMethodReturnType<Types.Static<Contract>['server'][Method]>,
  >(method: Method, callback: (context: Types.Static<Context>, ...params: Parameters) => Promise<ReturnType> | ReturnType): (context: Types.Static<Context>, ...params: Parameters) => Promise<ReturnType>

  /** Defines a server method implementation */
  public method(...args: any[]): any {
    const [method, authorize, callback] = args.length === 3 ? [args[0], args[1], args[2]] : [args[0], (context: any) => context, args[1]]
    const target = (this.contract.server as any)[method] as Types.TFunction | undefined
    if (target === undefined) throw Error(`Cannot define method '${method}' as it does not exist in contract`)
    this.#methods.register(method, target, authorize, callback)
    return async (context: Types.Static<Context>, ...params: any[]) => await this.#methods.execute(context, method, params)
  }

  /** Calls a remote client method */
  public async call<
    Method extends keyof Types.Static<Contract>['client'] extends infer R ? (R extends string ? R : never) : never,
    Parameters extends Types.ContractMethodParamters<Types.Static<Contract>['client'][Method]>,
    ReturnType extends Types.ContractMethodReturnType<Types.Static<Contract>['client'][Method]>,
  >(clientId: string, method: Method, ...params: Parameters): Promise<ReturnType> {
    if (!this.#sockets.has(clientId)) throw new Error('ClientId not found')
    const handle = this.#responder.register(clientId)
    const socket = this.#sockets.get(clientId)!
    const request = Methods.RpcProtocol.encodeRequest(handle, method, params)
    const message = this.#encoder.encode(request)
    socket.send(message)
    return await this.#responder.wait(handle)
  }

  /** Sends a message to a remote client method and ignores the result */
  public send<Method extends keyof Types.Static<Contract>['client'] extends infer R ? (R extends string ? R : never) : never, Parameters extends Types.ContractMethodParamters<Types.Static<Contract>['client'][Method]>>(
    clientId: string,
    method: Method,
    ...params: Parameters
  ): void {
    if (!this.#sockets.has(clientId)) return
    const socket = this.#sockets.get(clientId)!
    const request = Methods.RpcProtocol.encodeRequest(undefined, method, params)
    const message = this.#encoder.encode(request)
    socket.send(message)
  }

  /** Closes a client */
  public close(clientId: string): void {
    if (!this.#sockets.has(clientId)) return
    const socket = this.#sockets.get(clientId)!
    socket.close()
  }

  // -------------------------------------------------------------------------------------------
  // Host Functions
  // -------------------------------------------------------------------------------------------

  public async upgrade(clientId: string, request: IncomingMessage): Promise<boolean> {
    const context = await this.#onAuthorizeCallback(clientId, new Request(request))
    if (this.#contextTypeCheck.Check(context)) {
      this.#contexts.set(clientId, context)
      return true
    } else {
      return false
    }
  }

  public async accept(clientId: string, socket: any /** WebSocket */) {
    // esModuleInterop issue on socket type (do not force esModuleInterop on users)
    this.#sockets.set(clientId, socket)
    socket.binaryType = 'arraybuffer'
    socket.addEventListener('message', (event: MessageEvent) => this.#onMessageHandler(clientId, socket, event))
    socket.addEventListener('error', (event: ErrorEvent) => this.#onErrorHandler(clientId, event))
    socket.addEventListener('close', (event: CloseEvent) => this.#onCloseHandler(clientId, event))
    const context = this.#resolveContext(clientId)
    await this.#onConnectCallback(context)
  }

  // -------------------------------------------------------------------------------------------
  // Request
  // -------------------------------------------------------------------------------------------

  async #dispatchError(clientId: string, error: Error) {
    try {
      await this.#onErrorCallback(clientId, error)
    } catch {
      /* ignore */
    }
  }

  async #sendResponseWithResult(socket: WebSocket, rpcRequest: Methods.RpcRequest, result: unknown) {
    if (rpcRequest.id === undefined || rpcRequest.id === null) return
    const response = Methods.RpcProtocol.encodeResult(rpcRequest.id, result)
    const buffer = this.#encoder.encode(response)
    socket.send(buffer)
  }

  async #sendResponseWithError(socket: WebSocket, rpcRequest: Methods.RpcRequest, error: Error) {
    if (rpcRequest.id === undefined || rpcRequest.id === null) return
    if (error instanceof Types.ServiceException) {
      const response = Methods.RpcProtocol.encodeError(rpcRequest.id, { code: error.code, message: error.message, data: error.data })
      const buffer = this.#encoder.encode(response)
      socket.send(buffer)
    } else {
      const code = Methods.RpcErrorCode.InternalServerError
      const message = 'Internal Server Error'
      const data = {}
      const response = Methods.RpcProtocol.encodeError(rpcRequest.id, { code, message, data })
      const buffer = this.#encoder.encode(response)
      socket.send(buffer)
    }
  }

  async #executeRequest(clientId: string, socket: WebSocket, rpcRequest: Methods.RpcRequest) {
    const context = this.#resolveContext(clientId)
    try {
      const result = await this.#methods.execute(context, rpcRequest.method, rpcRequest.params)
      await this.#sendResponseWithResult(socket, rpcRequest, result)
    } catch (error) {
      this.#dispatchError(clientId, error as Error)
      await this.#sendResponseWithError(socket, rpcRequest, error as Error)
    }
  }

  // -------------------------------------------------------------------------------------------
  // Response
  // -------------------------------------------------------------------------------------------

  #executeResponse(rpcResponse: Methods.RpcResponse) {
    if (rpcResponse.result !== undefined) {
      this.#responder.resolve(rpcResponse.id, rpcResponse.result)
    } else if (rpcResponse.error) {
      const { message, code, data } = rpcResponse.error
      this.#responder.reject(rpcResponse.id, new Types.ServiceException(message, code, data))
    }
  }

  // -------------------------------------------------------------------------------------------
  // Socket Events
  // -------------------------------------------------------------------------------------------

  async #onMessageHandler(clientId: string, socket: WebSocket, event: MessageEvent) {
    try {
      const message = Methods.RpcProtocol.decodeAny(this.#encoder.decode(event.data as Uint8Array))
      if (message === undefined) return
      if (message.type === 'request') {
        await this.#executeRequest(clientId, socket, message.data)
      } else if (message.type === 'response') {
        await this.#executeResponse(message.data)
      } else {
      }
    } catch (error) {
      this.#onErrorCallback(clientId, error)
    }
  }

  #onErrorHandler(clientId: string, event: ErrorEvent) {
    this.#onErrorCallback(clientId, event)
  }

  #onCloseHandler(clientId: string, event: CloseEvent) {
    this.#responder.rejectFor(clientId, new Error('Client disconnected'))
    const context = this.#resolveContext(clientId)
    this.#contexts.delete(clientId)
    this.#sockets.delete(clientId)
    this.#onCloseCallback(context)
  }

  // -------------------------------------------------------------------------------------------
  // Utility
  // -------------------------------------------------------------------------------------------

  #resolveContext(clientId: string) {
    if (!this.#contexts.has(clientId)) throw Error(`Critical: Cannot locate associated context for clientId '${clientId}'`)
    return this.#contexts.get(clientId)!
  }

  #setupNotImplemented() {
    for (const [name, schema] of Object.entries(this.contract.server)) {
      this.#methods.register(
        name,
        schema as Types.TFunction,
        (context: any) => context,
        () => {
          throw new Types.ServiceException(`Method '${name}' not implemented`, Methods.RpcErrorCode.InternalServerError, {})
        },
      )
    }
  }
}
