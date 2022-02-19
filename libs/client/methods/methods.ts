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

import { Exception, TSchema, TFunction } from '@sidewinder/contract'
import { RpcErrorCode } from './protocol'

export interface RegisteredClientMethod {
    /** The callback function */
    callback: Function
    schema: TSchema
}

/** 
 * A Client method container for a set of methods. This container provides an interface to allow
 * callers to register functions and execute those functions directly or via JSON RPC 2.0 protocol.
 * This container works like the ServiceMethods container except data is not strictly validated by
 * JSON Schema.
 */
export class ClientMethods {
    private readonly methods: Map<string, RegisteredClientMethod>
    
    constructor() {
        this.methods = new Map<string, RegisteredClientMethod>()
    }
    
    /** Registers a client method. */
    public register(method: string, schema: TFunction<any[], any>, callback: Function) {
        this.methods.set(method, { callback, schema })
    }
    
    /** Executes a client method and returns its result. */
    public async execute(method: string, params: unknown[]) {
        this.validateMethodExists(method)
        const entry = this.methods.get(method)!
        this.validateMethodParameters(entry, method, params)
        const output = await entry.callback(...params)
        // Note: To support void, we remap a undefined result to null
        const result = output === undefined ? null : output
        this.validateMethodReturnType(entry, method as string, result)
        return result
    }

    private validateMethodExists(method: string) {
        if (!this.methods.has(method)) {
            throw new Exception(`Method not found`, RpcErrorCode.MethodNotFound, {})
        }
    }

    private validateMethodParameters(entry: RegisteredClientMethod, method: string, params: unknown[]) {
        // note: Validation not implemented on clients
    }

    private validateMethodReturnType(entry: RegisteredClientMethod, method: string, result: unknown) {
        // note: Validation not implemented on clients
    }
}