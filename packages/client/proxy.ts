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

import { RpcSocketClient } from './websocket'
import { RpcClient } from './web'

/** Remaps functions of the given object to return promises. */
type RemapWebProxyCallMethods<T extends object> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? (...args: Parameters<T[K]>) => Promise<ReturnType<T[K]>> : never
}

/** Extracts the server contract and remaps each method to return a promise. */
export type WebProxy<T> = T extends RpcSocketClient<infer Contract>
  ? RemapWebProxyCallMethods<Contract['static']['server']> extends infer I
    ? { [K in keyof I]: I[K] }
    : never
  : T extends RpcClient<infer Contract>
  ? RemapWebProxyCallMethods<Contract['static']['server']> extends infer I
    ? { [K in keyof I]: I[K] }
    : never
  : never

/**
 * Converts a WebClient or WebSocketClient into a callable proxy object. This enables functions
 * to be called directly object without specifying method names as strings.
 */
export function WebProxy<T extends RpcClient<any> | RpcSocketClient<any>>(client: T): WebProxy<T> {
  return new Proxy(client, {
    get:
      (target: any, method: any) =>
      (...params: any[]) =>
        target.call(method, ...params),
  })
}
