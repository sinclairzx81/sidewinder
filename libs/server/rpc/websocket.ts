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

import { Exception, Static, Type, TSchema, TString, TContract, TFunction, AuthorizeFunction, AuthorizeFunctionReturnType, ContractMethodParamters, ContractMethodReturnType } from '@sidewinder/contract'
import { TypeCompiler, TypeCheck } from '@sidewinder/type/compiler'
import { ServiceMethods, Responder, RpcErrorCode, RpcProtocol, RpcRequest, RpcResponse } from './methods/index'
import { Encoder, JsonEncoder, MsgPackEncoder } from './encoder/index'
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
export class WebSocketService<Contract extends TContract, Context extends TSchema = TString> {
  private _onAuthorizeCallback: WebSocketServiceAuthorizeCallback<Static<Context>>
  private _onConnectCallback: WebSocketServiceConnectCallback<Static<Context>>
  private _onCloseCallback: WebSocketServiceCloseCallback<Static<Context>>
  private _onErrorCallback: WebSocketServiceErrorCallback

  private readonly _contextTypeCheck: TypeCheck<Context>
  private readonly _contexts: Map<string, Static<Context>>
  private readonly _sockets: Map<string, WebSocket>
  private readonly _encoder: Encoder
  private readonly _responder: Responder
  private readonly _methods: ServiceMethods

  /**
   * Creates a new WebSocketService
   * @param contract The contract this service should use.
   * @param context The context this service should use.
   */
  constructor(private readonly contract: Contract, private readonly context: Context = Type.String() as any) {
    this._contextTypeCheck = TypeCompiler.Compile(this.context)
    this._onAuthorizeCallback = (clientId: string) => clientId as any
    this._onConnectCallback = () => {}
    this._onErrorCallback = () => {}
    this._onCloseCallback = () => {}
    this._contexts = new Map<string, Static<Context>>()
    this._sockets = new Map<string, WebSocket>()
    this._encoder = this.contract.format === 'json' ? new JsonEncoder() : new MsgPackEncoder()
    this._responder = new Responder()
    this._methods = new ServiceMethods()
    this._setupNotImplemented()
  }

  /**
   * Subscribes to authorize events. This event is raised once for each incoming WebSocket request. Subscribing to
   * this event is mandatory if the service provides a context schema. The authorize event must return a value
   * that conforms to the services context or throw if the user is not authorized. This context is reused for
   * subsequence calls on this service.
   */
  public event(event: 'authorize', callback: WebSocketServiceAuthorizeCallback<Static<Context>>): WebSocketServiceAuthorizeCallback<Static<Context>>

  /**
   * Subscribes to connect events. This event is raised immediately following a successful 'authorize' event only.
   * This event receives the context returned from a successful authorization.
   */
  public event(event: 'connect', callback: WebSocketServiceConnectCallback<Static<Context>>): WebSocketServiceConnectCallback<Static<Context>>

  /**
   * Subscribes to close events. This event is raised whenever the remote WebSocket disconnects from the service.
   * Callers should use this event to clean up any associated state created for the connection. This event receives
   * the context returned from a successful authorization.
   */
  public event(event: 'close', callback: WebSocketServiceCloseCallback<Static<Context>>): WebSocketServiceCloseCallback<Static<Context>>

  /**
   * Subcribes to error events. This event is raised for any socket transport errors and is usually following
   * immediately by a close event. This event receives the initial clientId string value only.
   */
  public event(event: 'error', callback: WebSocketServiceErrorCallback): WebSocketServiceErrorCallback

  public event(event: string, callback: (...args: any[]) => any): any {
    switch (event) {
      case 'authorize': {
        this._onAuthorizeCallback = callback
        break
      }
      case 'connect': {
        this._onConnectCallback = callback
        break
      }
      case 'error': {
        this._onErrorCallback = callback
        break
      }
      case 'close': {
        this._onCloseCallback = callback
        break
      }
      default:
        throw Error(`Unknown event '${event}'`)
    }
    return callback
  }

  /** Returns an iterator for each clientId currently connected to this service */
  public clients(): IterableIterator<string> {
    return this._sockets.keys()
  }

  /** Defines a server method implementation with method level authorization */
  public method<
    Method extends keyof Static<Contract>['server'] extends infer R ? (R extends string ? R : never) : never,
    Parameters extends ContractMethodParamters<Static<Contract>['server'][Method]>,
    ReturnType extends ContractMethodReturnType<Static<Contract>['server'][Method]>,
    Authorize extends AuthorizeFunction<Static<Context>, any>,
  >(method: Method, authorize: Authorize, callback: (context: AuthorizeFunctionReturnType<Authorize>, ...params: Parameters) => Promise<ReturnType> | ReturnType): (context: Static<Context>, ...params: Parameters) => Promise<ReturnType>

  /** Defines a server method implementation */
  public method<
    Method extends keyof Static<Contract>['server'] extends infer R ? (R extends string ? R : never) : never,
    Parameters extends ContractMethodParamters<Static<Contract>['server'][Method]>,
    ReturnType extends ContractMethodReturnType<Static<Contract>['server'][Method]>,
  >(method: Method, callback: (context: Static<Context>, ...params: Parameters) => Promise<ReturnType> | ReturnType): (context: Static<Context>, ...params: Parameters) => Promise<ReturnType>

  /** Defines a server method implementation */
  public method(...args: any[]): any {
    const [method, authorize, callback] = args.length === 3 ? [args[0], args[1], args[2]] : [args[0], (context: any) => context, args[1]]
    const target = (this.contract.server as any)[method] as TFunction | undefined
    if (target === undefined) throw Error(`Cannot define method '${method}' as it does not exist in contract`)
    this._methods.register(method, target, authorize, callback)
    return async (context: Static<Context>, ...params: any[]) => await this._methods.execute(context, method, params)
  }

  /** Calls a remote client method */
  public async call<
    Method extends keyof Static<Contract>['client'] extends infer R ? (R extends string ? R : never) : never,
    Parameters extends ContractMethodParamters<Static<Contract>['client'][Method]>,
    ReturnType extends ContractMethodReturnType<Static<Contract>['client'][Method]>,
  >(clientId: string, method: Method, ...params: Parameters): Promise<ReturnType> {
    if (!this._sockets.has(clientId)) throw new Error('ClientId not found')
    const handle = this._responder.register(clientId)
    const socket = this._sockets.get(clientId)!
    const request = RpcProtocol.encodeRequest(handle, method, params)
    const message = this._encoder.encode(request)
    socket.send(message)
    return await this._responder.wait(handle)
  }

  /** Sends a message to a remote client method and ignores the result */
  public send<Method extends keyof Static<Contract>['client'] extends infer R ? (R extends string ? R : never) : never, Parameters extends ContractMethodParamters<Static<Contract>['client'][Method]>>(
    clientId: string,
    method: Method,
    ...params: Parameters
  ): void {
    if (!this._sockets.has(clientId)) return
    const socket = this._sockets.get(clientId)!
    const request = RpcProtocol.encodeRequest(undefined, method, params)
    const message = this._encoder.encode(request)
    socket.send(message)
  }

  /** Closes a client */
  public close(clientId: string): void {
    if (!this._sockets.has(clientId)) return
    const socket = this._sockets.get(clientId)!
    socket.close()
  }

  // -------------------------------------------------------------------------------------------
  // Host Functions
  // -------------------------------------------------------------------------------------------

  public async upgrade(clientId: string, request: IncomingMessage): Promise<boolean> {
    const context = await this._onAuthorizeCallback(clientId, new Request(request))
    if (this._contextTypeCheck.Check(context)) {
      this._contexts.set(clientId, context)
      return true
    } else {
      return false
    }
  }

  public async accept(clientId: string, socket: any /** WebSocket */) {
    // esModuleInterop issue
    this._sockets.set(clientId, socket)
    socket.binaryType = 'arraybuffer'
    socket.addEventListener('message', (event: MessageEvent) => this._onMessageHandler(clientId, socket, event))
    socket.addEventListener('error', (event: ErrorEvent) => this._onErrorHandler(clientId, event))
    socket.addEventListener('close', (event: CloseEvent) => this._onCloseHandler(clientId, event))
    const context = this._resolveContext(clientId)
    await this._onConnectCallback(context)
  }

  // -------------------------------------------------------------------------------------------
  // Request
  // -------------------------------------------------------------------------------------------

  private async _dispatchError(clientId: string, error: Error) {
    try {
      await this._onErrorCallback(clientId, error)
    } catch {
      /* ignore */
    }
  }

  private async _sendResponseWithResult(socket: WebSocket, rpcRequest: RpcRequest, result: unknown) {
    if (rpcRequest.id === undefined || rpcRequest.id === null) return
    const response = RpcProtocol.encodeResult(rpcRequest.id, result)
    const buffer = this._encoder.encode(response)
    socket.send(buffer)
  }

  private async _sendResponseWithError(socket: WebSocket, rpcRequest: RpcRequest, error: Error) {
    if (rpcRequest.id === undefined || rpcRequest.id === null) return
    if (error instanceof Exception) {
      const response = RpcProtocol.encodeError(rpcRequest.id, { code: error.code, message: error.message, data: error.data })
      const buffer = this._encoder.encode(response)
      socket.send(buffer)
    } else {
      const code = RpcErrorCode.InternalServerError
      const message = 'Internal Server Error'
      const data = {}
      const response = RpcProtocol.encodeError(rpcRequest.id, { code, message, data })
      const buffer = this._encoder.encode(response)
      socket.send(buffer)
    }
  }

  private async _executeRequest(clientId: string, socket: WebSocket, rpcRequest: RpcRequest) {
    const context = this._resolveContext(clientId)
    try {
      const result = await this._methods.execute(context, rpcRequest.method, rpcRequest.params)
      await this._sendResponseWithResult(socket, rpcRequest, result)
    } catch (error) {
      this._dispatchError(clientId, error as Error)
      await this._sendResponseWithError(socket, rpcRequest, error as Error)
    }
  }

  // -------------------------------------------------------------------------------------------
  // Response
  // -------------------------------------------------------------------------------------------

  private _executeResponse(rpcResponse: RpcResponse) {
    if (rpcResponse.result !== undefined) {
      this._responder.resolve(rpcResponse.id, rpcResponse.result)
    } else if (rpcResponse.error) {
      const { message, code, data } = rpcResponse.error
      this._responder.reject(rpcResponse.id, new Exception(message, code, data))
    }
  }

  // -------------------------------------------------------------------------------------------
  // Socket Events
  // -------------------------------------------------------------------------------------------

  private async _onMessageHandler(clientId: string, socket: WebSocket, event: MessageEvent) {
    try {
      const message = RpcProtocol.decodeAny(this._encoder.decode(event.data as Uint8Array))
      if (message === undefined) return
      if (message.type === 'request') {
        await this._executeRequest(clientId, socket, message.data)
      } else if (message.type === 'response') {
        await this._executeResponse(message.data)
      } else {
      }
    } catch (error) {
      this._onErrorCallback(clientId, error)
    }
  }

  private _onErrorHandler(clientId: string, event: ErrorEvent) {
    this._onErrorCallback(clientId, event)
  }

  private _onCloseHandler(clientId: string, event: CloseEvent) {
    this._responder.rejectFor(clientId, new Error('Client disconnected'))
    const context = this._resolveContext(clientId)
    this._contexts.delete(clientId)
    this._sockets.delete(clientId)
    this._onCloseCallback(context)
  }

  // -------------------------------------------------------------------------------------------
  // Utility
  // -------------------------------------------------------------------------------------------

  private _resolveContext(clientId: string) {
    if (!this._contexts.has(clientId)) throw Error(`Critical: Cannot locate associated context for clientId '${clientId}'`)
    return this._contexts.get(clientId)!
  }

  private _setupNotImplemented() {
    for (const [name, schema] of Object.entries(this.contract.server)) {
      this._methods.register(
        name,
        schema as TFunction,
        (context: any) => context,
        () => {
          throw new Exception(`Method '${name}' not implemented`, RpcErrorCode.InternalServerError, {})
        },
      )
    }
  }
}
