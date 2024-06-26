/*--------------------------------------------------------------------------

@sidewinder/server

The MIT License (MIT)

Copyright (c) 2022-2024 Haydn Paterson (sinclair) <haydn.developer@gmail.com>

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

import { Static, TSchema, Type } from '@sidewinder/contract'
import { Validator } from '@sidewinder/validator'

// -------------------------------------------------------------------------
// Protocol Types
// -------------------------------------------------------------------------

export enum RpcErrorCode {
  ParseError = -32700, // Invalid JSON was received by the server.
  InvalidRequest = -32600, // The JSON sent is not a valid Request object.
  MethodNotFound = -32601, // The method does not exist / is not available.
  InvalidParams = -32602, // Invalid method parameter(s).
  InternalError = -32603, // Internal JSON-RPC error.
  InternalServerError = -32001, // (custom) Reserved for implementation-defined server-errors.
}

function Nullable<T extends TSchema>(schema: T) {
  return Type.Union([schema, Type.Null()])
}

export type RpcRequest = Static<typeof RpcRequest>
export const RpcRequest = Type.Object({
  jsonrpc: Type.Literal('2.0'),
  method: Type.String(),
  params: Type.Array(Type.Unknown()),
  id: Type.Optional(Nullable(Type.String())),
})

export type RpcError = Static<typeof RpcError>
export const RpcError = Type.Object({
  code: Type.Integer(),
  message: Type.String(),
  data: Type.Optional(Type.Unknown()),
})

export type RpcResponse = Static<typeof RpcResponse>
export const RpcResponse = Type.Object({
  jsonrpc: Type.Literal('2.0'),
  result: Type.Optional(Type.Unknown()),
  error: Type.Optional(RpcError),
  id: Type.String(),
})

export type RpcRequestOrResponse = Static<typeof RpcRequestOrResponse>
export const RpcRequestOrResponse = Type.Union([RpcRequest, RpcResponse])

// -------------------------------------------------------------------------
// Decoded Response
// -------------------------------------------------------------------------

export interface DecodedRpcRequest {
  type: 'request'
  data: RpcRequest
}
export interface DecodedRpcResponse {
  type: 'response'
  data: RpcResponse
}

export type DecodeAnyResult = DecodedRpcRequest | DecodedRpcResponse

export namespace RpcProtocol {
  const validateRequestOrResponse = new Validator(RpcRequestOrResponse)

  export function encodeRequest(id: string | undefined, method: string, params: unknown[]): any {
    return { id, jsonrpc: '2.0', method, params }
  }

  export function encodeResult(id: string, result: unknown): RpcResponse {
    return { jsonrpc: '2.0', id, result }
  }

  export function encodeError(id: string, error: RpcError): RpcResponse {
    return { jsonrpc: '2.0', id, error }
  }

  export function decodeAny(request: unknown): DecodeAnyResult | undefined {
    const object = request as RpcRequestOrResponse
    const result = validateRequestOrResponse.check(object)
    if (!result.success) return undefined
    return (<any>object)['method'] ? { type: 'request', data: object as RpcRequest } : { type: 'response', data: object as RpcResponse }
  }
}
