/*--------------------------------------------------------------------------

@sidewinder/service

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

import { Buffer } from '@sidewinder/buffer'
import { ServiceRequest } from '../request'

export class RestRequest {
  readonly #request: ServiceRequest
  readonly #params: Map<string, string>

  constructor(request: ServiceRequest, params: Record<string, string>, public readonly clientId: string) {
    this.#request = request
    this.#params = this.#readParams(params)
  }

  public get ipAddress(): string {
    return this.#request.ipAddress
  }

  /** Gets the http headers for this request */
  public get headers() {
    return this.#request.headers
  }

  /** Gets the parsed querystring parameters for this request */
  public get query() {
    return this.#request.query
  }

  /** Gets the parsed params obtain from the url pattern */
  public get params(): Map<string, string> {
    return this.#params
  }

  /** Reads one buffer from this request */
  public async read(): Promise<Uint8Array | null> {
    return await this.#request.read()
  }

  /** Returns the raw url for this request */
  public get url() {
    return this.#request.url
  }

  /** Returns the http method for this request */
  public get method() {
    return this.#request.method
  }

  /** Reads the body of this request as a Uint8Array */
  public async arrayBuffer(): Promise<Uint8Array> {
    return await this.#request.read()
  }

  /** Reads the body of this request as text */
  public async text(options?: TextDecodeOptions): Promise<string> {
    return Buffer.decode(await this.arrayBuffer(), options)
  }

  /** Reads the body of this request as json */
  public async json<T>(): Promise<T> {
    return JSON.parse(await this.text())
  }

  // ------------------------------------------------------------------------------
  // Privates
  // ------------------------------------------------------------------------------

  #readParams(params: Record<string, string>) {
    const map = new Map<string, string>()
    for (const key of Object.keys(params)) {
      map.set(key, params[key])
    }
    return map
  }
}
