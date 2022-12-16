/*--------------------------------------------------------------------------

@sidewinder/service

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

import { Exception, Static, Type, TSchema, TString, TContract, TFunction, AuthorizeFunction, AuthorizeFunctionReturnType, ContractMethodParamters, ContractMethodReturnType } from '@sidewinder/contract'
import { ServiceMethods, RpcErrorCode, RpcProtocol, RpcRequest, RpcResponse } from './methods/index'
import { Encoder, JsonEncoder, MsgPackEncoder } from './encoder/index'
import { Validator } from '@sidewinder/validator'
import { ServiceRequest } from '../request'
import { ServiceResponse } from '../response'

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

export type WebServiceAuthorizeCallback<Context> = (clientId: string, request: ServiceRequest) => Promise<Context> | Context
export type WebServiceConnectCallback<Context> = (context: Context) => Promise<void> | void
export type WebServiceCloseCallback<Context> = (context: Context) => Promise<void> | void
export type WebServiceErrorCallback = (clientId: string, error: unknown) => Promise<void> | void

/** A JSON RPC 2.0 based HTTP service that supports remote method invocation via HTTP POST requests. */
export class WebService<Contract extends TContract, Context extends TSchema = TString> {
  #onAuthorizeCallback: WebServiceAuthorizeCallback<Static<Context>>
  #onConnectCallback: WebServiceConnectCallback<Static<Context>>
  #onCloseCallback: WebServiceCloseCallback<Static<Context>>
  #onErrorCallback: WebServiceErrorCallback
  readonly #contextValidator: Validator<Context>
  readonly #methods: ServiceMethods
  readonly #encoder: Encoder

  /**
   * Creates a new WebService
   * @param contract The contract this service should use.
   * @param context The context this service should use.
   */
  constructor(private readonly contract: Contract, private readonly context: Context = Type.String() as any) {
    this.#contextValidator = new Validator(this.context)
    this.#onAuthorizeCallback = (clientId: string) => clientId as any
    this.#onConnectCallback = () => {}
    this.#onErrorCallback = () => {}
    this.#onCloseCallback = () => {}
    this.#encoder = this.contract.format === 'json' ? new JsonEncoder() : new MsgPackEncoder()
    this.#methods = new ServiceMethods()
    this.#setupNotImplemented()
  }

  /**
   * Subscribes to authorize events. This event is raised for every incoming Http Rpc request. Subscribing to
   * this event is mandatory if the service provides a context schema. The authorize event must return a value
   * that conforms to the services context or throw if the user is not authorized.
   */
  public event(event: 'authorize', callback: WebServiceAuthorizeCallback<Static<Context>>): WebServiceAuthorizeCallback<Static<Context>>

  /**
   * Subscribes to connect events. This event is raised immediately following a successful 'authorize' event only.
   * This event receives the context returned from a successful authorization.
   */
  public event(event: 'connect', callback: WebServiceConnectCallback<Static<Context>>): WebServiceConnectCallback<Static<Context>>

  /**
   * Subscribes to close events. This event is raised whenever the remote Http request is about to close.
   * Callers should use this event to clean up any associated state created for the request. This event receives
   * the context returned from a successful authorization.
   */
  public event(event: 'close', callback: WebServiceCloseCallback<Static<Context>>): WebServiceCloseCallback<Static<Context>>

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
    this.#methods.register(method, target, authorize, callback)
    return async (context: Static<Context>, ...params: any[]) => await this.#methods.execute(context, method, params)
  }

  // ---------------------------------------------------------------------
  // Raw IO
  // ---------------------------------------------------------------------

  /** Reads the request as a Uint8Array */
  async #readRequestBuffer(request: ServiceRequest): Promise<Uint8Array> {
    if (request.method !== 'post') throw new Error('Can only read from http post requests')
    return await request.read()
  }

  /** Writes a response buffer */
  async #writeResponseBuffer(response: ServiceResponse, status: number, data: Uint8Array): Promise<void> {
    const contentType = this.contract.format === 'json' ? 'application/json' : 'application/x-msgpack'
    const contentLength = data.length.toString()
    await response.writeHead(status, 'OK', { 'Content-Type': contentType, 'Content-Length': contentLength })
    await response.write(data)
    await response.end()
  }

  // ---------------------------------------------------------------------
  // Protocol
  // ---------------------------------------------------------------------

  /** Reads the RpcRequest from the http request body */
  async #readRpcRequest(request: ServiceRequest): Promise<PipelineResult<RpcRequest>> {
    const buffer = await this.#readRequestBuffer(request)
    const decoded = RpcProtocol.decodeAny(this.#encoder.decode(buffer))
    if (decoded === undefined) return PipelineResult.error(Error('Unable to read protocol request'))
    if (decoded.type !== 'request') return PipelineResult.error(Error('Protocol request was not of type request'))
    return PipelineResult.ok(decoded.data)
  }

  /** Writes an RpcResponse to the Http Body */
  async #writeRpcResponse(response: ServiceResponse, status: number, rpcresponse: RpcResponse): Promise<void> {
    const buffer = this.#encoder.encode(rpcresponse)
    this.#writeResponseBuffer(response, status, buffer).catch(() => {})
  }

  // ---------------------------------------------------------------------
  // Content Type
  // ---------------------------------------------------------------------

  async #checkContentType(clientId: string, request: ServiceRequest): Promise<PipelineResult<null>> {
    const expectedContentType = this.contract.format === 'json' ? 'application/json' : 'application/x-msgpack'
    const actualContentType = request.headers.get('content-type')
    if (expectedContentType !== actualContentType) {
      return PipelineResult.error(new Error('Invalid Content Type'))
    } else {
      return PipelineResult.ok(null)
    }
  }

  // ---------------------------------------------------------------------
  // Context
  // ---------------------------------------------------------------------

  async #readRpcContext(clientId: string, request: ServiceRequest): Promise<PipelineResult<Static<Context>>> {
    try {
      const context = await this.#onAuthorizeCallback(clientId, request)
      return PipelineResult.ok(context)
    } catch (error) {
      return PipelineResult.error(error as Error)
    }
  }

  #checkRpcContext(rpcContext: Static<Context>): PipelineResult<null> {
    const result = this.#contextValidator.check(rpcContext)
    if (result.success) return PipelineResult.ok(null)
    return PipelineResult.error(new Error('Rpc Context is invalid'))
  }

  // ---------------------------------------------------------------------
  // Errors
  // ---------------------------------------------------------------------

  async #dispatchError(clientId: string, error: Error) {
    try {
      await this.#onErrorCallback(clientId, error)
    } catch {
      /* ignore */
    }
  }

  async #writeInvalidContentType(clientId: string, response: ServiceResponse) {
    const contentType = this.contract.format === 'json' ? 'application/json' : 'application/x-msgpack'
    return await this.#writeRpcResponse(
      response,
      401,
      RpcProtocol.encodeError('', {
        data: {},
        code: RpcErrorCode.InvalidRequest,
        message: `Invalid Content-Type header. Expected '${contentType}'`,
      }),
    ).catch((error) => this.#dispatchError(clientId, error))
  }

  async #writeAuthorizationError(clientId: string, response: ServiceResponse) {
    return await this.#writeRpcResponse(
      response,
      401,
      RpcProtocol.encodeError('', {
        data: {},
        code: RpcErrorCode.InvalidRequest,
        message: 'Authorization Failed',
      }),
    ).catch((error) => this.#dispatchError(clientId, error))
  }

  async #writeRpcContextInvalidError(clientId: string, response: ServiceResponse) {
    return await this.#writeRpcResponse(
      response,
      500,
      RpcProtocol.encodeError('', {
        data: {},
        code: RpcErrorCode.InternalServerError,
        message: 'Service request context is invalid. The request cannot proceed.',
      }),
    ).catch((error) => this.#dispatchError(clientId, error))
  }

  async #writeRpcRequestInvalidError(clientId: string, response: ServiceResponse) {
    return await this.#writeRpcResponse(
      response,
      400,
      RpcProtocol.encodeError('', {
        data: {},
        code: RpcErrorCode.InvalidRequest,
        message: 'The request was invalid',
      }),
    ).catch((error) => this.#dispatchError(clientId, error))
  }

  async #writeExecuteError(clientId: string, response: ServiceResponse, rpcRequest: RpcRequest, error: Error) {
    if (rpcRequest.id === undefined) {
      await this.#writeResponseBuffer(response, 200, Buffer.from('{}')).catch((error) => this.#dispatchError(clientId, error))
    } else {
      if (error instanceof Exception) {
        const [code, data, message] = [error.code, error.data, error.message]
        await this.#writeRpcResponse(response, 400, RpcProtocol.encodeError('', { data, code, message })).catch((error) => this.#dispatchError(clientId, error))
      } else {
        const [code, data, message] = [RpcErrorCode.InternalServerError, {}, 'Internal Server Error']
        return await this.#writeRpcResponse(response, 500, RpcProtocol.encodeError('', { data, code, message })).catch((error) => this.#dispatchError(clientId, error))
      }
    }
  }

  async #writeExecuteResult(clientId: string, response: ServiceResponse, rpcRequest: RpcRequest, result: unknown) {
    if (rpcRequest.id === undefined) {
      await this.#writeResponseBuffer(response, 200, Buffer.from('{}')).catch((error) => this.#dispatchError(clientId, error))
    } else {
      await this.#writeRpcResponse(response, 200, RpcProtocol.encodeResult('', result)).catch((error) => this.#dispatchError(clientId, error))
    }
  }

  // ------------------------------------------------------------------------
  // Execute
  // ------------------------------------------------------------------------

  async #executeRpcRequest(rpcContext: Static<Context>, rpcRequest: RpcRequest): Promise<PipelineResult<any>> {
    try {
      const result = await this.#methods.execute(rpcContext, rpcRequest.method, rpcRequest.params)
      return PipelineResult.ok(result)
    } catch (error) {
      return PipelineResult.error(error as Error)
    }
  }

  // -------------------------------------------------------------------------------------------
  // Host Functions
  // -------------------------------------------------------------------------------------------

  /** Accepts an incoming HTTP request and processes it as JSON RPC method call. This method is called automatically by the Host. */
  public async accept(clientId: string, request: ServiceRequest, response: ServiceResponse) {
    // -----------------------------------------------------------------------
    // ECONNRESET: Try to catch errors writing to output
    // -----------------------------------------------------------------------
    try {
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
    } catch (error) {
      if (!(error instanceof Error)) {
        this.#dispatchError(clientId, new Error('Unknown error occurred accepting web request'))
      } else {
        this.#dispatchError(clientId, error)
      }
    }
  }

  #setupNotImplemented() {
    for (const [name, schema] of Object.entries(this.contract.server)) {
      this.#methods.register(
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
