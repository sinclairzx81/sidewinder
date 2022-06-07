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
import { Validator } from '@sidewinder/validator'
import { RpcErrorCode } from './protocol'

export interface RegisteredServerMethod {
  /** The parameter validator */
  paramsValidator: Validator<any>
  /** The return type validator */
  returnValidator: Validator<any>
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
  readonly #methods: Map<string, RegisteredServerMethod>

  constructor() {
    this.#methods = new Map<string, RegisteredServerMethod>()
  }

  // ------------------------------------------------------------------------------
  // Publics
  // ------------------------------------------------------------------------------
  
  public register(method: string, schema: TFunction<any[], any>, authorize: Function, callback: Function) {
    const paramsValidator = new Validator(Type.Tuple(schema.parameters))
    const returnValidator = new Validator(schema.returns)
    this.#methods.set(method, { paramsValidator, returnValidator, authorize, callback })
  }

  public async execute(context: unknown, method: string, params: unknown[]) {
    this.#validateMethodExists(method)
    const entry = this.#methods.get(method)!
    const methodContext = await this.#authorize(context, entry)
    this.#validateMethodParameters(entry, method, params)
    const output = await entry.callback(methodContext, ...params)
    // Note: To support void, we remap a undefined result to null
    const result = output === undefined ? null : output
    this.#validateMethodReturnType(entry, method as string, result)
    return result
  }

  // ------------------------------------------------------------------------------
  // Publics
  // ------------------------------------------------------------------------------
  
  async #authorize(context: unknown, entry: RegisteredServerMethod) {
    try {
      return await entry.authorize(context)
    } catch {
      throw new Exception('Method Authorization Failed', RpcErrorCode.InvalidRequest, {})
    }
  }

  #validateMethodExists(method: string) {
    if (!this.#methods.has(method)) {
      throw new Exception(`Method not found`, RpcErrorCode.MethodNotFound, {})
    }
  }

  #validateMethodParameters(entry: RegisteredServerMethod, method: string, params: unknown[]) {
    const check = entry.paramsValidator.check(params)
    if (!check.success) {
      throw new Exception(`Invalid parameters for method ${method}(...). ${check.errorText}`, RpcErrorCode.InvalidParams, check.success)
    }
  }

  #validateMethodReturnType(entry: RegisteredServerMethod, method: string, result: unknown) {
    const check = entry.returnValidator.check(result)
    if (!check.success) {
      throw new Exception(`Method '${method}' returned an invalid result`, RpcErrorCode.InternalServerError, {})
    }
  }
}
