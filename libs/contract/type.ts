/*--------------------------------------------------------------------------

@sidewinder/contract

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

import { TypeBuilder, TSchema, TFunction } from '@sidewinder/type'
export * from '@sidewinder/type'

// --------------------------------------------------------------------------
// Authorize Function
// --------------------------------------------------------------------------

export type AuthorizeFunction<Context, AuthorizedContext> = (context: Context) => AuthorizedContext

export type AuthorizeFunctionReturnType<T> = T extends AuthorizeFunction<any, infer Context> 
    ? Context extends Promise<infer I> ? I : Context
    : never

// --------------------------------------------------------------------------
// TContract
// --------------------------------------------------------------------------

type DefinedOr<T, R> = keyof T extends never ? R : T

export type ContractFormat<T> = T extends 'json' | 'msgpack' ? T : 'json'

export type ContractMethodParamters<T> = T extends (...args: any) => any ? Parameters<T> extends infer P ? P extends any[] ? P : [] : [] : []

export type ContractMethodReturnType<T> = T extends (...args: any) => any ? ReturnType<T> extends infer P ? P : unknown : unknown

export interface TInterface {
    [name: string]: TFunction<any[], any>
}

export interface ContractOptions {
    /** The encoding format for this contract. The default is 'json' */
    format?: 'json' | 'msgpack'
    /** The server interface methods */
    server?: TInterface
    /** The client interface methods */
    client?: TInterface
}

export interface TContract<Options extends ContractOptions = ContractOptions> extends TSchema {
    $static: {
        /** The encoding format for this contract. The default is 'json' */
        format: ContractFormat<Options['format']>
        /** The server interface methods */
        server: DefinedOr<Options['server'], {}> extends infer Interface ? {
            [K in keyof Interface]: Interface[K] extends TFunction<any[], any> ? Interface[K]['$static'] : never
        } : {},
        /** The client interface methods */
        client: DefinedOr<Options['client'], {}> extends infer Interface ? {
            [K in keyof Interface]: Interface[K] extends TFunction<any[], any> ? Interface[K]['$static'] : never
        }: {}
    },
    type: 'contract',
    kind: 'Contract',
    /** The encoding format for this contract. The default is 'json' */
    format: ContractFormat<Options['format']>,
    /** The server interface methods */
    server: DefinedOr<Options['server'], {}>,
    /** The client interface methods */
    client: DefinedOr<Options['client'], {}>,
}


export class ContractTypeBuilder extends TypeBuilder {
    /** Creates a contract type */
    public Contract<Options extends ContractOptions>(options: Options): TContract<Options> {
        const format = options.format || 'json'
        const server = options.server || {}
        const client = options.client || {}
        return this.Create({ type: 'contract', kind: 'Contract', format, server, client })
    }
}

/** Extended TypeBuilder with additional Contract Types */
export const Type = new ContractTypeBuilder()