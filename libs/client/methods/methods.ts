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

import { Exception, TFunction } from '@sidewinder/contract'
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

export interface RegisteredClientMethod {
    /** The callback function */
    callback: Function
}

type MethodName = string 

export class ClientMethods {
    private readonly methods: Map<MethodName, RegisteredClientMethod>
    
    constructor() {
        this.methods = new Map<MethodName, RegisteredClientMethod>()
    }
    
    public register(method: MethodName, schema: TFunction<any[], any>, callback: Function) {
        this.methods.set(method, { callback })
    }
    
    public async executeClientMethod(method: MethodName, params: unknown[]) {
        this.validateMethodExists(method)
        const entry = this.methods.get(method)!
        this.validateMethodParameters(entry, method, params)
        const result = await entry.callback(...params)
        this.validateMethodReturnType(entry, method, result)
        return result
    }

    public async executeClientProtocol(request: RpcRequest): Promise<ExecuteResponse> {
        try {
            const result = await this.executeClientMethod(request.method, request.params)
            return this.encodeResultExecuteResponse(request, result)
        } catch (error) {
            if(error instanceof Exception) {
                return this.encodeErrorExecuteResponse(request, error)
            } else {
                const exception = new Exception('Internal Server Error', RpcErrorCode.InternalServerError, {})
                return this.encodeErrorExecuteResponse(request, exception)
            }
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

    private validateMethodParameters(entry: RegisteredClientMethod, method: string, params: unknown[]) {

    }

    private validateMethodReturnType(entry: RegisteredClientMethod, method: string, result: unknown) {

    }
}