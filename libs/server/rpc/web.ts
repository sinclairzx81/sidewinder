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

import type { IncomingMessage, ServerResponse } from 'http'

import { TypeCompiler, TypeCheck } from '@sidewinder/type/compiler'
import * as Types from '@sidewinder/contract'
import * as Methods from './methods/index'
import * as Encoding from './encoding/index'
import { Platform } from '@sidewinder/platform'
import { HttpService } from '../http/http'
import { Request } from './request'

// --------------------------------------------------------------------------
// WebService Request Pipeline
// --------------------------------------------------------------------------

class PipelineResult<Value> {
  constructor(private readonly _value?: Value, private readonly _error?: Error) {}
  public ok() {
    return this._error === undefined
  }

  public value() {
    if (this.ok()) return this._value!
    throw new Error('Result has no value')
  }

  public error() {
    if (!this.ok()) return this._error!
    throw new Error('Result has no error')
  }

  public static ok<Result>(value: Result): PipelineResult<Result> {
    return new PipelineResult(value, undefined)
  }

  public static error<Result>(error: Error): PipelineResult<Result> {
    return new PipelineResult(undefined as any, error)
  }
}

// --------------------------------------------------------------------------
// WebService
// --------------------------------------------------------------------------

export type WebServiceAuthorizeCallback<Context> = (clientId: string, request: Request) => Promise<Context> | Context
export type WebServiceConnectCallback<Context> = (context: Context) => Promise<void> | void
export type WebServiceCloseCallback<Context> = (context: Context) => Promise<void> | void
export type WebServiceErrorCallback = (clientId: string, error: unknown) => Promise<void> | void

/** A JSON RPC 2.0 based HTTP service that supports remote method invocation via HTTP POST requests. */
export class WebService<Contract extends Types.TContract, Context extends Types.TSchema = Types.TString> extends HttpService {
  readonly #contextTypeCheck: TypeCheck<Context>
  readonly #methods: Methods.ServiceMethods
  readonly #encoder: Encoding.Encoder

  #onAuthorizeCallback: WebServiceAuthorizeCallback<Types.Static<Context>>
  #onConnectCallback: WebServiceConnectCallback<Types.Static<Context>>
  #onCloseCallback: WebServiceCloseCallback<Types.Static<Context>>
  #onErrorCallback: WebServiceErrorCallback

  /** Creates a new WebService */
  constructor(private readonly contract: Contract, private readonly context: Context = Types.Type.String() as any) {
    super()
    this.#contextTypeCheck = TypeCompiler.Compile(this.context)
    this.#onAuthorizeCallback = (clientId: string) => clientId as any
    this.#onConnectCallback = () => {}
    this.#onErrorCallback = () => {}
    this.#onCloseCallback = () => {}
    this.#encoder = this.contract.format === 'json' ? new Encoding.JsonEncoder() : new Encoding.MsgPackEncoder()
    this.#methods = new Methods.ServiceMethods()
    this.#setupNotImplemented()
  }

  /**
   * Subscribes to authorize events. This event is raised for every incoming Http Rpc request. Subscribing to
   * this event is mandatory if the service provides a context schema. The authorize event must return a value
   * that conforms to the services context or throw if the user is not authorized.
   */
  public event(event: 'authorize', callback: WebServiceAuthorizeCallback<Types.Static<Context>>): WebServiceAuthorizeCallback<Types.Static<Context>>

  /**
   * Subscribes to connect events. This event is raised immediately following a successful 'authorize' event only.
   * This event receives the context returned from a successful authorization.
   */
  public event(event: 'connect', callback: WebServiceConnectCallback<Types.Static<Context>>): WebServiceConnectCallback<Types.Static<Context>>

  /**
   * Subscribes to close events. This event is raised whenever the remote Http request is about to close.
   * Callers should use this event to clean up any associated state created for the request. This event receives
   * the context returned from a successful authorization.
   */
  public event(event: 'close', callback: WebServiceCloseCallback<Types.Static<Context>>): WebServiceCloseCallback<Types.Static<Context>>

  /**
   * Subscribes to error events. This event is raised if there are any http transport errors. This event
   * is usually immediately followed by a close event.
   */
  public event(event: 'error', callback: WebServiceErrorCallback): WebServiceErrorCallback

  /** Subscribes to events */
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

  /** Accepts an incoming HTTP request and processes it as JSON RPC method call. This method is called automatically by the Host. */
  public async accept(clientId: string, request: IncomingMessage, response: ServerResponse) {
    // -----------------------------------------------------------------
    // Preflight
    // -----------------------------------------------------------------
    const checkContentTypeResult = await this.#checkContentType(clientId, request)
    if (!checkContentTypeResult.ok()) return this.#writeInvalidContentType(clientId, response)

    const rpcContextResult = await this.#readRpcContext(clientId, request)
    if (!rpcContextResult.ok()) return this.#writeAuthorizationError(clientId, response)

    const rpcContextCheckResult = this.#checkRpcContext(rpcContextResult.value())
    if (!rpcContextCheckResult.ok()) return this.#writeRpcContextInvalidError(clientId, response)

    const rpcRequestResult = await this.#readRpcRequest(request)
    if (!rpcRequestResult.ok()) return this.#writeRpcRequestInvalidError(clientId, response)

    // -----------------------------------------------------------------
    // Execute
    // -----------------------------------------------------------------

    await this.#onConnectCallback(rpcContextResult.value())
    const executeResult = await this.#executeRpcRequest(rpcContextResult.value(), rpcRequestResult.value())
    if (!executeResult.ok()) {
      this.#dispatchError(clientId, executeResult.error())
      await this.#writeExecuteError(clientId, response, rpcRequestResult.value(), executeResult.error())
      await this.#onCloseCallback(rpcContextResult.value())
    } else {
      await this.#writeExecuteResult(clientId, response, rpcRequestResult.value(), executeResult.value())
      await this.#onCloseCallback(rpcContextResult.value())
    }
  }

  /** Reads the request as a Uint8Array */
  #readRequestBuffer(request: IncomingMessage): Promise<Uint8Array> {
    if (request.method!.toLowerCase() !== 'post') return Promise.reject(new Error('Can only read from http post requests'))
    return new Promise((resolve, reject) => {
      const buffers: Buffer[] = []
      request.on('data', (buffer) => buffers.push(buffer))
      request.on('error', (error) => reject(error))
      request.on('end', () => resolve(Buffer.concat(buffers)))
    })
  }

  /** Writes a response buffer */
  #writeResponseBuffer(response: ServerResponse, status: number, data: Uint8Array): Promise<void> {
    return new Promise((resolve) => {
      const contentType = this.contract.format === 'json' ? 'application/json' : 'application/x-msgpack'
      const contentLength = data.length.toString()
      response.writeHead(status, { 'Content-Type': contentType, 'Content-Length': contentLength })
      const version = Platform.version()
      if (version.major < 16) {
        response.end(Buffer.from(data), () => resolve())
      } else {
        response.end(data, () => resolve())
      }
    })
  }

  /** Reads the RpcRequest from the http request body */
  async #readRpcRequest(request: IncomingMessage): Promise<PipelineResult<Methods.RpcRequest>> {
    const buffer = await this.#readRequestBuffer(request)
    const decoded = Methods.RpcProtocol.decodeAny(this.#encoder.decode(buffer))
    if (decoded === undefined) return PipelineResult.error(Error('Unable to read protocol request'))
    if (decoded.type !== 'request') return PipelineResult.error(Error('Protocol request was not of type request'))
    return PipelineResult.ok(decoded.data)
  }

  /** Writes an RpcResponse to the Http Body */
  async #writeRpcResponse(response: ServerResponse, status: number, rpcresponse: Methods.RpcResponse): Promise<void> {
    const buffer = this.#encoder.encode(rpcresponse)
    this.#writeResponseBuffer(response, status, buffer).catch(() => {})
  }

  async #checkContentType(clientId: string, request: IncomingMessage): Promise<PipelineResult<null>> {
    const expectedContentType = this.contract.format === 'json' ? 'application/json' : 'application/x-msgpack'
    const actualContentType = request.headers['content-type']
    if (expectedContentType !== actualContentType) {
      return PipelineResult.error(new Error('Invalid Content Type'))
    } else {
      return PipelineResult.ok(null)
    }
  }

  async #readRpcContext(clientId: string, request: IncomingMessage): Promise<PipelineResult<Types.Static<Context>>> {
    try {
      const context = await this.#onAuthorizeCallback(clientId, new Request(request))
      return PipelineResult.ok(context)
    } catch (error) {
      return PipelineResult.error(error as Error)
    }
  }

  #checkRpcContext(rpcContext: Types.Static<Context>): PipelineResult<null> {
    const result = this.#contextTypeCheck.Check(rpcContext)
    if (result) return PipelineResult.ok(null)
    return PipelineResult.error(new Error('Rpc Context is invalid'))
  }

  async #dispatchError(clientId: string, error: Error) {
    try {
      await this.#onErrorCallback(clientId, error)
    } catch {
      /* ignore */
    }
  }

  async #writeInvalidContentType(clientId: string, response: ServerResponse) {
    const contentType = this.contract.format === 'json' ? 'application/json' : 'application/x-msgpack'
    return await this.#writeRpcResponse(
      response,
      401,
      Methods.RpcProtocol.encodeError('', {
        data: {},
        code: Methods.RpcErrorCode.InvalidRequest,
        message: `Invalid Content-Type header. Expected '${contentType}'`,
      }),
    ).catch((error) => this.#dispatchError(clientId, error))
  }

  async #writeAuthorizationError(clientId: string, response: ServerResponse) {
    return await this.#writeRpcResponse(
      response,
      401,
      Methods.RpcProtocol.encodeError('', {
        data: {},
        code: Methods.RpcErrorCode.InvalidRequest,
        message: 'Authorization Failed',
      }),
    ).catch((error) => this.#dispatchError(clientId, error))
  }

  async #writeRpcContextInvalidError(clientId: string, response: ServerResponse) {
    return await this.#writeRpcResponse(
      response,
      500,
      Methods.RpcProtocol.encodeError('', {
        data: {},
        code: Methods.RpcErrorCode.InternalServerError,
        message: 'Service request context is invalid. The request cannot proceed.',
      }),
    ).catch((error) => this.#dispatchError(clientId, error))
  }

  async #writeRpcRequestInvalidError(clientId: string, response: ServerResponse) {
    return await this.#writeRpcResponse(
      response,
      400,
      Methods.RpcProtocol.encodeError('', {
        data: {},
        code: Methods.RpcErrorCode.InvalidRequest,
        message: 'The request was invalid',
      }),
    ).catch((error) => this.#dispatchError(clientId, error))
  }

  async #writeExecuteError(clientId: string, response: ServerResponse, rpcRequest: Methods.RpcRequest, error: Error) {
    if (rpcRequest.id === undefined) {
      await this.#writeResponseBuffer(response, 200, Buffer.from('{}')).catch((error) => this.#dispatchError(clientId, error))
    } else {
      if (error instanceof Types.Exception) {
        const [code, data, message] = [error.code, error.data, error.message]
        await this.#writeRpcResponse(response, 400, Methods.RpcProtocol.encodeError('', { data, code, message })).catch((error) => this.#dispatchError(clientId, error))
      } else {
        const [code, data, message] = [Methods.RpcErrorCode.InternalServerError, {}, 'Internal Server Error']
        return await this.#writeRpcResponse(response, 500, Methods.RpcProtocol.encodeError('', { data, code, message })).catch((error) => this.#dispatchError(clientId, error))
      }
    }
  }

  async #writeExecuteResult(clientId: string, response: ServerResponse, rpcRequest: Methods.RpcRequest, result: unknown) {
    if (rpcRequest.id === undefined) {
      await this.#writeResponseBuffer(response, 200, Buffer.from('{}')).catch((error) => this.#dispatchError(clientId, error))
    } else {
      await this.#writeRpcResponse(response, 200, Methods.RpcProtocol.encodeResult('', result)).catch((error) => this.#dispatchError(clientId, error))
    }
  }

  async #executeRpcRequest(rpcContext: Types.Static<Context>, rpcRequest: Methods.RpcRequest): Promise<PipelineResult<any>> {
    try {
      const result = await this.#methods.execute(rpcContext, rpcRequest.method, rpcRequest.params)
      return PipelineResult.ok(result)
    } catch (error) {
      return PipelineResult.error(error as Error)
    }
  }

  #setupNotImplemented() {
    for (const [name, schema] of Object.entries(this.contract.server)) {
      this.#methods.register(
        name,
        schema as Types.TFunction,
        (context: any) => context,
        () => {
          throw new Types.Exception(`Method '${name}' not implemented`, Methods.RpcErrorCode.InternalServerError, {})
        },
      )
    }
  }
}
