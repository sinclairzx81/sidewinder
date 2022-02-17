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

import { Exception, Type, TFunction } from '@sidewinder/contract'
import { Validator } from '@sidewinder/validation'
import { RpcProtocol, RpcErrorCode, RpcRequest, RpcResponse } from './protocol'


export interface ExecuteResultWithResponse {
    type: 'result-with-response'
    result: unknown
    response: RpcResponse
}

export interface ExecuteErrorWithResponse {
    type: 'error-with-response'
    error: Error
    response: RpcResponse
}

export interface ExecuteResult {
    type: 'result'
    result: unknown
}

export interface ExecuteError {
    type: 'error'
    error: Error
}

export type ExecuteResponse =
    | ExecuteResultWithResponse
    | ExecuteErrorWithResponse
    | ExecuteResult
    | ExecuteError

export interface RegisteredServerMethod {
    /** The parameter validator */
    paramsValidator: Validator<any>
    /** The return type validator */
    returnValidator: Validator<any>
    /** The context mapping function */
    mapping: (clientId: string) => any
    /** The callback function */
    callback: Function
}

type MethodName = string 

/** 
 * A Service method container for a set of methods. This container provides an interface to allow
 * callers to register schema validated function and execute those function either directly or
 * via JSON RPC 2.0 protocol.
 */
export class ServiceMethods {
    private readonly methods: Map<MethodName, RegisteredServerMethod>
    
    constructor() {
        this.methods = new Map<MethodName, RegisteredServerMethod>()
    }

    public register(method: MethodName, schema: TFunction<any[], any>, mapping: (clientId: string) => any, callback: Function) {
        const paramsValidator = new Validator(Type.Tuple(schema.parameters))
        const returnValidator = new Validator(schema.returns)
        this.methods.set(method, { paramsValidator, returnValidator, mapping, callback })
    }
    
    public async executeServerMethod(clientId: string, method: MethodName, params: unknown[]) {
        this.validateMethodExists(method)
        const entry = this.methods.get(method)!
        this.validateMethodParameters(entry, method as string, params)
        const output = await entry.callback(entry.mapping(clientId), ...params)
        // Note: To support void, we remap a undefined result to null
        const result = output === undefined ? null : output
        this.validateMethodReturnType(entry, method as string, result)
        return result
    }

    public async executeServerProtocol(clientId: string, request: RpcRequest): Promise<ExecuteResponse> {
        try {
            const result = await this.executeServerMethod(clientId, request.method, request.params)
            return this.encodeResultExecuteResponse(request, result)
        } catch (error) {
            return this.encodeErrorExecuteResponse(request, error)
        }
    }

    private encodeResultExecuteResponse(request: RpcRequest, result: unknown): ExecuteResponse {
        if (request.id) {
            const response = RpcProtocol.encodeResult(request.id, result)
            return { type: 'result-with-response', result, response }
        } else {
            return { type: 'result', result }
        }
    }

    private encodeErrorExecuteResponse(request: RpcRequest, error: unknown): ExecuteResponse {
        if (request.id) {
            if (error instanceof Exception) {
                const { code, message, data } = error
                const response = RpcProtocol.encodeError(request.id, { code, message, data })
                return { type: 'error-with-response', error, response }
            } else if (error instanceof Error) {
                const code = RpcErrorCode.InternalServerError
                const message = 'Internal Server Error'
                const data = {}
                const response = RpcProtocol.encodeError(request.id, { code, message, data })
                return { type: 'error-with-response', error, response }
            } else {
                const code = RpcErrorCode.InternalServerError
                const message = 'Internal Server Error'
                const data = {}
                const response = RpcProtocol.encodeError(request.id, { code, message, data })
                return { type: 'error-with-response', error: Error(`Exception thrown: ${error}`), response }
            }
        } else {
            if (error instanceof Exception) {
                return { type: 'error', error }
            } else if (error instanceof Error) {
                return { type: 'error', error }
            } else {
                return { type: 'error', error: Error(`Exception thrown: ${error}`) }
            }
        }
    }

    private validateMethodExists(method: MethodName) {
        if (!this.methods.has(method)) {
            throw new Exception(`Method not found`, RpcErrorCode.MethodNotFound, {})
        }
    }

    private validateMethodParameters(entry: RegisteredServerMethod, method: string, params: unknown[]) {
        const check = entry.paramsValidator.check(params)
        if (!check.success) {
            throw new Exception(`Parameters for method '${method}' are invalid`, RpcErrorCode.InvalidParams, check.success)
        }
    }

    private validateMethodReturnType(entry: RegisteredServerMethod, method: string, result: unknown) {
        const check = entry.returnValidator.check(result)
        if (!check.success) {
            throw new Exception(`Method '${method}' returned an invalid result`, RpcErrorCode.InternalServerError, {})
        }
    }
}