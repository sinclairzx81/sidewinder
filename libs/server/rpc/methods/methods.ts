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

import { ServiceException, Type, TFunction } from '@sidewinder/contract'
import { TypeCompiler, TypeCheck } from '@sidewinder/type/compiler'
import { RpcErrorCode } from './protocol'

export interface ServerMethodEntry {
  /** The parameter validator */
  paramsTypeCheck: TypeCheck<any>
  /** The return type validator */
  returnTypeCheck: TypeCheck<any>
  /** The authorize function */
  authorize: Function
  /** The callback function */
  callback: Function
}

/**
 * A Service method container for a set of methods. This container provides an interface to allow
 * callers to register schema validated function and execute those function either directly or
 * via JSON RPC 2.0 protocol.
 */
export class ServiceMethods {
  readonly _methods: Map<string, ServerMethodEntry>

  constructor() {
    this._methods = new Map<string, ServerMethodEntry>()
  }

  public register(method: string, schema: TFunction<any[], any>, authorize: Function, callback: Function) {
    const paramsValidator = TypeCompiler.Compile(Type.Tuple(schema.parameters))
    const returnValidator = TypeCompiler.Compile(schema.returns)
    this._methods.set(method, { paramsTypeCheck: paramsValidator, returnTypeCheck: returnValidator, authorize, callback })
  }

  public async execute(context: unknown, method: string, params: unknown[]) {
    this._validateMethodExists(method)
    const entry = this._methods.get(method)!
    const methodContext = await this._authorize(context, entry)
    this._validateMethodParameters(entry, method, params)
    const output = await entry.callback(methodContext, ...params)
    // Note: To support void, we remap a undefined result to null
    const result = output === undefined ? null : output
    this._validateMethodReturnType(entry, method as string, result)
    return result
  }

  // ------------------------------------------------------------------------------
  // Privates
  // ------------------------------------------------------------------------------

  private async _authorize(context: unknown, entry: ServerMethodEntry) {
    try {
      return await entry.authorize(context)
    } catch {
      throw new ServiceException('Method Authorization Failed', RpcErrorCode.InvalidRequest, {})
    }
  }

  private _validateMethodExists(method: string) {
    if (!this._methods.has(method)) {
      throw new ServiceException(`Method not found`, RpcErrorCode.MethodNotFound, {})
    }
  }

  private _validateMethodParameters(entry: ServerMethodEntry, method: string, params: unknown[]) {
    if (entry.paramsTypeCheck.Check(params)) return
    const errors = [...entry.paramsTypeCheck.Errors(params)]
    throw new ServiceException(`Invalid parameters for method ${method}(...).`, RpcErrorCode.InvalidParams, { errors })
  }

  private _validateMethodReturnType(entry: ServerMethodEntry, method: string, result: unknown) {
    if (entry.returnTypeCheck.Check(result)) return
    throw new ServiceException(`Method '${method}' returned an invalid result`, RpcErrorCode.InternalServerError, {})
  }
}
