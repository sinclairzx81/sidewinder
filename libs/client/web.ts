import { TContract, ResolveContractMethodParameters, ResolveContractMethodReturnType, TFunction } from '@sidewinder/contract'
import { Methods, Exception, Responder, Encoder, Barrier, RpcErrorCode, RpcProtocol } from '@sidewinder/shared'
import { post } from './post/index'

export class WebClient<Contract extends TContract> {

    constructor(public readonly contract: Contract, public readonly endpoint: string) { }

    public async call<
        Method extends keyof Contract['$static']['server'],
        Parameters extends ResolveContractMethodParameters<Contract['$static']['server'][Method]>,
        ReturnType extends ResolveContractMethodReturnType<Contract['$static']['server'][Method]>
    >(method: Method, ...params: Parameters): Promise<ReturnType> {
        const request = RpcProtocol.encodeRequest('unknown', method as string, params)
        const encoded = Encoder.encode(request)
        const decoded = Encoder.decode(await post(this.endpoint, {}, encoded))
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

    public send<
        Method extends keyof Contract['$static']['server'],
        Parameters extends ResolveContractMethodParameters<Contract['$static']['server'][Method]>,
        >(method: Method, ...params: Parameters) {
        const request = RpcProtocol.encodeRequest('unknown', method as string, params)
        const encoded = Encoder.encode(request)
        post(this.endpoint, {}, encoded).catch(() => { /* ignore */ })
    }
}