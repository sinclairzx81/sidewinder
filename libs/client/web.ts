import { TContract, ResolveContractMethodParameters, ResolveContractMethodReturnType } from '@sidewinder/contract'
import { Exception, Encoder, MsgPackEncoder, JsonEncoder, RpcProtocol } from '@sidewinder/shared'
import { Request} from './request/index'

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