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

import { Exception, Static, Type, TSchema, TString, TContract, TFunction, AuthorizeFunction, AuthorizeFunctionReturnType, ContractMethodParamters, ContractMethodReturnType } from '@sidewinder/contract'
import { TypeCompiler, TypeCheck } from '@sidewinder/type/compiler'
import { ServiceMethods, RpcErrorCode, RpcProtocol, RpcRequest, RpcResponse } from './methods/index'
import { Encoder, JsonEncoder, MsgPackEncoder } from './encoder/index'
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
export class WebService<Contract extends TContract, Context extends TSchema = TString> extends HttpService {
  private readonly _contextTypeCheck: TypeCheck<Context>
  private readonly _methods: ServiceMethods
  private readonly _encoder: Encoder

  private _onAuthorizeCallback: WebServiceAuthorizeCallback<Static<Context>>
  private _onConnectCallback: WebServiceConnectCallback<Static<Context>>
  private _onCloseCallback: WebServiceCloseCallback<Static<Context>>
  private _onErrorCallback: WebServiceErrorCallback

  /** Creates a new WebService */
  constructor(private readonly contract: Contract, private readonly context: Context = Type.String() as any) {
    super()
    this._contextTypeCheck = TypeCompiler.Compile(this.context)
    this._onAuthorizeCallback = (clientId: string) => clientId as any
    this._onConnectCallback = () => {}
    this._onErrorCallback = () => {}
    this._onCloseCallback = () => {}
    this._encoder = this.contract.format === 'json' ? new JsonEncoder() : new MsgPackEncoder()
    this._methods = new ServiceMethods()
    this._setupNotImplemented()
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

  /** Accepts an incoming HTTP request and processes it as JSON RPC method call. This method is called automatically by the Host. */
  public async accept(clientId: string, request: IncomingMessage, response: ServerResponse) {
    // -----------------------------------------------------------------
    // Preflight
    // -----------------------------------------------------------------
    const checkContentTypeResult = await this._checkContentType(clientId, request)
    if (!checkContentTypeResult.ok()) return this._writeInvalidContentType(clientId, response)

    const rpcContextResult = await this._readRpcContext(clientId, request)
    if (!rpcContextResult.ok()) return this._writeAuthorizationError(clientId, response)

    const rpcContextCheckResult = this._checkRpcContext(rpcContextResult.value())
    if (!rpcContextCheckResult.ok()) return this._writeRpcContextInvalidError(clientId, response)

    const rpcRequestResult = await this._readRpcRequest(request)
    if (!rpcRequestResult.ok()) return this._writeRpcRequestInvalidError(clientId, response)

    // -----------------------------------------------------------------
    // Execute
    // -----------------------------------------------------------------

    await this._onConnectCallback(rpcContextResult.value())
    const executeResult = await this._executeRpcRequest(rpcContextResult.value(), rpcRequestResult.value())
    if (!executeResult.ok()) {
      this._dispatchError(clientId, executeResult.error())
      await this._writeExecuteError(clientId, response, rpcRequestResult.value(), executeResult.error())
      await this._onCloseCallback(rpcContextResult.value())
    } else {
      await this._writeExecuteResult(clientId, response, rpcRequestResult.value(), executeResult.value())
      await this._onCloseCallback(rpcContextResult.value())
    }
  }

  // ---------------------------------------------------------------------
  // Raw IO
  // ---------------------------------------------------------------------

  /** Reads the request as a Uint8Array */
  private _readRequestBuffer(request: IncomingMessage): Promise<Uint8Array> {
    if (request.method!.toLowerCase() !== 'post') return Promise.reject(new Error('Can only read from http post requests'))
    return new Promise((resolve, reject) => {
      const buffers: Buffer[] = []
      request.on('data', (buffer) => buffers.push(buffer))
      request.on('error', (error) => reject(error))
      request.on('end', () => resolve(Buffer.concat(buffers)))
    })
  }

  /** Writes a response buffer */
  private _writeResponseBuffer(response: ServerResponse, status: number, data: Uint8Array): Promise<void> {
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

  // ---------------------------------------------------------------------
  // Protocol
  // ---------------------------------------------------------------------

  /** Reads the RpcRequest from the http request body */
  private async _readRpcRequest(request: IncomingMessage): Promise<PipelineResult<RpcRequest>> {
    const buffer = await this._readRequestBuffer(request)
    const decoded = RpcProtocol.decodeAny(this._encoder.decode(buffer))
    if (decoded === undefined) return PipelineResult.error(Error('Unable to read protocol request'))
    if (decoded.type !== 'request') return PipelineResult.error(Error('Protocol request was not of type request'))
    return PipelineResult.ok(decoded.data)
  }

  /** Writes an RpcResponse to the Http Body */
  private async _writeRpcResponse(response: ServerResponse, status: number, rpcresponse: RpcResponse): Promise<void> {
    const buffer = this._encoder.encode(rpcresponse)
    this._writeResponseBuffer(response, status, buffer).catch(() => {})
  }

  private async _checkContentType(clientId: string, request: IncomingMessage): Promise<PipelineResult<null>> {
    const expectedContentType = this.contract.format === 'json' ? 'application/json' : 'application/x-msgpack'
    const actualContentType = request.headers['content-type']
    if (expectedContentType !== actualContentType) {
      return PipelineResult.error(new Error('Invalid Content Type'))
    } else {
      return PipelineResult.ok(null)
    }
  }

  async _readRpcContext(clientId: string, request: IncomingMessage): Promise<PipelineResult<Static<Context>>> {
    try {
      const context = await this._onAuthorizeCallback(clientId, new Request(request))
      return PipelineResult.ok(context)
    } catch (error) {
      return PipelineResult.error(error as Error)
    }
  }

  private _checkRpcContext(rpcContext: Static<Context>): PipelineResult<null> {
    const result = this._contextTypeCheck.Check(rpcContext)
    if (result) return PipelineResult.ok(null)
    return PipelineResult.error(new Error('Rpc Context is invalid'))
  }

  private async _dispatchError(clientId: string, error: Error) {
    try {
      await this._onErrorCallback(clientId, error)
    } catch {
      /* ignore */
    }
  }

  private async _writeInvalidContentType(clientId: string, response: ServerResponse) {
    const contentType = this.contract.format === 'json' ? 'application/json' : 'application/x-msgpack'
    return await this._writeRpcResponse(
      response,
      401,
      RpcProtocol.encodeError('', {
        data: {},
        code: RpcErrorCode.InvalidRequest,
        message: `Invalid Content-Type header. Expected '${contentType}'`,
      }),
    ).catch((error) => this._dispatchError(clientId, error))
  }

  private async _writeAuthorizationError(clientId: string, response: ServerResponse) {
    return await this._writeRpcResponse(
      response,
      401,
      RpcProtocol.encodeError('', {
        data: {},
        code: RpcErrorCode.InvalidRequest,
        message: 'Authorization Failed',
      }),
    ).catch((error) => this._dispatchError(clientId, error))
  }

  private async _writeRpcContextInvalidError(clientId: string, response: ServerResponse) {
    return await this._writeRpcResponse(
      response,
      500,
      RpcProtocol.encodeError('', {
        data: {},
        code: RpcErrorCode.InternalServerError,
        message: 'Service request context is invalid. The request cannot proceed.',
      }),
    ).catch((error) => this._dispatchError(clientId, error))
  }

  private async _writeRpcRequestInvalidError(clientId: string, response: ServerResponse) {
    return await this._writeRpcResponse(
      response,
      400,
      RpcProtocol.encodeError('', {
        data: {},
        code: RpcErrorCode.InvalidRequest,
        message: 'The request was invalid',
      }),
    ).catch((error) => this._dispatchError(clientId, error))
  }

  private async _writeExecuteError(clientId: string, response: ServerResponse, rpcRequest: RpcRequest, error: Error) {
    if (rpcRequest.id === undefined) {
      await this._writeResponseBuffer(response, 200, Buffer.from('{}')).catch((error) => this._dispatchError(clientId, error))
    } else {
      if (error instanceof Exception) {
        const [code, data, message] = [error.code, error.data, error.message]
        await this._writeRpcResponse(response, 400, RpcProtocol.encodeError('', { data, code, message })).catch((error) => this._dispatchError(clientId, error))
      } else {
        const [code, data, message] = [RpcErrorCode.InternalServerError, {}, 'Internal Server Error']
        return await this._writeRpcResponse(response, 500, RpcProtocol.encodeError('', { data, code, message })).catch((error) => this._dispatchError(clientId, error))
      }
    }
  }

  private async _writeExecuteResult(clientId: string, response: ServerResponse, rpcRequest: RpcRequest, result: unknown) {
    if (rpcRequest.id === undefined) {
      await this._writeResponseBuffer(response, 200, Buffer.from('{}')).catch((error) => this._dispatchError(clientId, error))
    } else {
      await this._writeRpcResponse(response, 200, RpcProtocol.encodeResult('', result)).catch((error) => this._dispatchError(clientId, error))
    }
  }

  private async _executeRpcRequest(rpcContext: Static<Context>, rpcRequest: RpcRequest): Promise<PipelineResult<any>> {
    try {
      const result = await this._methods.execute(rpcContext, rpcRequest.method, rpcRequest.params)
      return PipelineResult.ok(result)
    } catch (error) {
      return PipelineResult.error(error as Error)
    }
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
