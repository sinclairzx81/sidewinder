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

import { Exception, Static, TContract, ContractMethodParamters, ContractMethodReturnType } from '@sidewinder/contract'
import { RpcProtocol } from './methods/index'
import { Encoder, MsgPackEncoder, JsonEncoder } from './encoder/index'
import { Request } from './request/index'

/** A JSON RPC 2.0 based HTTP client used to connect to Sidewinder WebService endpoints. */
export class RpcClient<Contract extends TContract> {
  private readonly encoder: Encoder

  constructor(private readonly contract: Contract, private readonly endpoint: string, private readonly additionalHeaders: Record<string, string> = {}) {
    this.encoder = contract.format === 'json' ? new JsonEncoder() : new MsgPackEncoder()
  }

  /** Calls a remote service method */
  public async call<
    Method extends keyof Static<Contract>['server'] extends infer R ? (R extends string ? R : never) : never,
    Parameters extends ContractMethodParamters<Static<Contract>['server'][Method]>,
    ReturnType extends ContractMethodReturnType<Static<Contract>['server'][Method]>,
  >(method: Method, ...params: Parameters): Promise<ReturnType> {
    this.assertMethodExists(method as string)
    const request = RpcProtocol.encodeRequest('unknown', method as string, params)
    const encoded = this.encoder.encode(request)
    const decoded = this.encoder.decode(await Request.call(this.contract, this.endpoint, this.additionalHeaders, encoded))
    const message = RpcProtocol.decodeAny(decoded)
    if (message === undefined) throw Error('Unable to decode response')
    if (message.type !== 'response') throw Error('Server responded with an invalid protocol response')
    const response = message.data
    if (response.result !== undefined) {
      return response.result as ReturnType
    } else if (response.error) {
      const { message, code, data } = response.error
      throw new Exception(message, code, data)
    }
    throw Error('Unreachable')
  }

  /** Sends a message to a remote service method and ignores the result */
  public send<Method extends keyof Static<Contract>['server'], Parameters extends ContractMethodParamters<Static<Contract>['server'][Method]>>(method: Method, ...params: Parameters) {
    this.assertMethodExists(method as string)
    const request = RpcProtocol.encodeRequest('unknown', method as string, params)
    const encoded = this.encoder.encode(request)
    Request.call(this.contract, this.endpoint, this.additionalHeaders, encoded).catch(() => {
      /* ignore */
    })
  }

  private assertMethodExists(method: string) {
    if (!Object.keys(this.contract.server).includes(method)) throw new Error(`Method '${method}' not defined in contract`)
  }
}
