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

import { TContract, ResolveContractMethodParameters, ResolveContractMethodReturnType, TFunction } from '@sidewinder/contract'
import { Methods, Exception, Responder, Encoder, RpcErrorCode, RpcProtocol } from '@sidewinder/shared'
import { Request, Response } from 'express'
import { IncomingMessage } from 'http'

export type WebServiceAuthorizeCallback = (clientId: string, request: IncomingMessage) => Promise<boolean> | boolean
export type WebServiceConnectCallback = (clientId: string) => Promise<void> | void
export type WebServiceErrorCallback = (clientId: string, error: unknown) => void
export type WebServiceCloseCallback = (clientId: string) => Promise<void> | void

export class WebService<Contract extends TContract> {
    private onAuthorizeCallback: WebServiceAuthorizeCallback
    private onConnectCallback: WebServiceConnectCallback
    private onErrorCallback: WebServiceErrorCallback
    private onCloseCallback: WebServiceCloseCallback
    private readonly methods: Methods

    constructor(public readonly contract: Contract) {
        this.onAuthorizeCallback = () => true
        this.onConnectCallback = () => { }
        this.onErrorCallback = () => { }
        this.onCloseCallback = () => { }
        this.methods = new Methods()
    }

    public event(event: 'authorize', callback: WebServiceAuthorizeCallback): WebServiceAuthorizeCallback
    public event(event: 'connect', callback: WebServiceConnectCallback): WebServiceConnectCallback
    public event(event: 'error', callback: WebServiceErrorCallback): WebServiceErrorCallback
    public event(event: 'close', callback: WebServiceCloseCallback): WebServiceCloseCallback
    public event(event: string, callback: (...args: any[]) => any): any {
        switch (event) {
            case 'authorize': { this.onAuthorizeCallback = callback; break }
            case 'connect': { this.onConnectCallback = callback; break }
            case 'error': { this.onErrorCallback = callback; break }
            case 'close': { this.onCloseCallback = callback; break }
            default: throw Error(`Unknown event '${event}'`)
        }
        return callback
    }

    /** Implements a server method. The method name must match the contract. */
    public method<
        Method extends keyof Contract['$static']['server'],
        Parameters extends ResolveContractMethodParameters<Contract['$static']['server'][Method]>,
        ReturnType extends ResolveContractMethodReturnType<Contract['$static']['server'][Method]>
    >(method: Method, callback: (clientId: string, ...params: Parameters) => Promise<ReturnType> | ReturnType) {
        this.methods.register(method, (this.contract.server as any)[method], callback)
        return async (clientId: string, ...params: Parameters): Promise<ReturnType> => {
            return this.methods.executeServerMethod(clientId, method, params)
        }
    }

    private readRequest(request: Request): Promise<Uint8Array> {
        return new Promise((resolve, reject) => {
            const buffers: Buffer[] = []
            request.on('data', buffer => buffers.push(buffer))
            request.on('error', error => reject(error))
            request.on('end', () => resolve(Buffer.concat(buffers)))
        })
    }

    private writeResponse(response: Response, status: number, data: Uint8Array): Promise<void> {
        return new Promise((resolve, reject) => {
            response.writeHead(status, {
                'Content-Type': 'application/x-sidewinder',
                'Content-Length': data.length.toString()
            })
            response.end(data, () => resolve())
        })
    }

    public async accept(clientId: string, request: Request, response: Response) {
        try {
            // -----------------------------------------------------------------------
            // Authorization
            // -----------------------------------------------------------------------

            const authorized = await this.onAuthorizeCallback(clientId, request)
            if (!authorized) {
                const [ code, data, message ] = [RpcErrorCode.InvalidRequest, {}, 'Unauthorized']
                return await this.writeResponse(response, 200, Encoder.encode(RpcProtocol.encodeError('unknown', {
                    data, code, message
                })))
            }

            // -----------------------------------------------------------------------
            // Connection Callback
            // -----------------------------------------------------------------------

            await this.onConnectCallback(clientId)

            // -----------------------------------------------------------------------
            // Execute
            // -----------------------------------------------------------------------

            const data = await this.readRequest(request)
            const message = RpcProtocol.decodeAny(Encoder.decode(data))
            if (message === undefined) return
            if (message.type === 'request') {
                const request = message.data
                const result = await this.methods.executeServerProtocol(clientId, request)
                if (result.type === 'result-with-response' || result.type === 'error-with-response') {
                    this.writeResponse(response, 200, Encoder.encode(result.response))
                } else {
                    this.writeResponse(response, 200, Buffer.alloc(0))
                }
            } else { 
                const [ code, data, message ] = [RpcErrorCode.InvalidRequest, {}, 'Invalid Request']
                return await this.writeResponse(response, 200, Encoder.encode(RpcProtocol.encodeError('unknown', {
                    data, code, message
                })))
            }
        } catch (error) {
            this.onErrorCallback(clientId, error)
            if(error instanceof Exception) {
                const [ code, data, message ] = [error.code, error.data, error.message]
                return await this.writeResponse(response, 200, Encoder.encode(RpcProtocol.encodeError('unknown', {
                    data, code, message
                })))
            } else {
                const [ code, data, message ] = [RpcErrorCode.InternalServerError,  {}, 'Internal Server Error']
                return await this.writeResponse(response, 200, Encoder.encode(RpcProtocol.encodeError('unknown', {
                    data, code, message
                })))
            }
        }

        // ------------------------------------------------------------------
        // Close Callback
        // ------------------------------------------------------------------

        await this.onCloseCallback(clientId)
    }
}