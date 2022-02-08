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

import { TContract, ResolveContractMethodParameters, ResolveContractMethodReturnType } from '@sidewinder/contract'
import { Encoder, MsgPackEncoder, JsonEncoder } from '@sidewinder/shared'
import { Exception, RpcProtocol } from './methods/index'
import { Request } from './request/index'


export class WebClient<Contract extends TContract> {
    private readonly encoder: Encoder

    constructor(public readonly contract: Contract, public readonly endpoint: string) { 
        this.encoder = contract.format === 'json' ? new JsonEncoder() : new MsgPackEncoder()
    }

    /** Calls a remote method */
    public async call<
        Method extends keyof Contract['$static']['server'],
        Parameters extends ResolveContractMethodParameters<Contract['$static']['server'][Method]>,
        ReturnType extends ResolveContractMethodReturnType<Contract['$static']['server'][Method]>
    >(method: Method, ...params: Parameters): Promise<ReturnType> {
        const request = RpcProtocol.encodeRequest('unknown', method as string, params)
        const encoded = this.encoder.encode(request)
        const decoded = this.encoder.decode(await Request.call(this.endpoint, {}, encoded))
        const message = RpcProtocol.decodeAny(decoded)
        if (message === undefined) throw Error('Unable to decode response')
        if(message.type !== 'response') throw Error('Server responded with an invalid protocol response')
        const response = message.data
        if (response.result !== undefined) {
            return response.result as ReturnType
        } else if (response.error) {
            const { message, code, data } = response.error
            throw new Exception(message, code, data)
        }
        throw Error('Unreachable')
    }

    /** Sends a message to a remote method and ignores the result */
    public send<
        Method extends keyof Contract['$static']['server'],
        Parameters extends ResolveContractMethodParameters<Contract['$static']['server'][Method]>,
        >(method: Method, ...params: Parameters) {
        const request = RpcProtocol.encodeRequest('unknown', method as string, params)
        const encoded = this.encoder.encode(request)
        request(this.endpoint, {}, encoded).catch(() => { /* ignore */ })
    }
}