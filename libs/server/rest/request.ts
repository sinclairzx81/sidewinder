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

import { Buffer } from '@sidewinder/buffer'
import { ReadonlyMap, HttpHeaderKeys } from '../http/index'
import { parse as parseQueryString } from 'qs'
import { IncomingMessage } from 'http'

export class RestRequest {
  private readonly internalIpAddress: string
  private readonly internalHeaders: Map<string, string>
  private readonly internalQuery: Map<string, string>
  private readonly internalParams: Map<string, string>

  constructor(private readonly request: IncomingMessage, params: Record<string, string>, public readonly clientId: string) {
    this.internalIpAddress = this.readIpAddress(request)
    this.internalHeaders = this.readHeaders(request)
    this.internalQuery = this.readQuery(request)
    this.internalParams = this.readParams(params)
  }

  /**
   * Gets the ip address associated with this request. This address will either
   * be the raw socket remoteAddress, or in the instance of a load balancer, the
   * x-forwarded-for address. If no address can be resolved, then this function
   * returns 0.0.0.0.
   */
  public get ipAddress(): string {
    return this.internalIpAddress
  }

  /** Gets the http headers for this request */
  public get headers(): ReadonlyMap<HttpHeaderKeys> {
    return this.internalHeaders
  }

  /** Gets the parsed querystring parameters for this request */
  public get query(): ReadonlyMap<string> {
    return this.internalQuery
  }

  /** Gets the parsed params obtain from the url pattern */
  public get params(): ReadonlyMap<string> {
    return this.internalParams
  }

  /** Reads one buffer from this request */
  public async read(): Promise<Uint8Array | null> {
    return await this.request.read()
  }

  /** Async iterator for this request. */
  public async *[Symbol.asyncIterator]() {
    yield* this.request
  }

  /** Returns the raw url for this request */
  public get url() {
    return this.request.url
  }

  /** Returns the http method for this request */
  public get method() {
    return this.request.method
  }

  /** Reads the body of this request as a Uint8Array */
  public async arrayBuffer(): Promise<Uint8Array> {
    if (this.request.method?.toLowerCase() === 'get') {
      throw new Error('Unable to read body from GET request')
    }
    return new Promise<Uint8Array>((resolve, reject) => {
      const buffers: Uint8Array[] = []
      this.request.on('data', (buffer) => buffers.push(buffer))
      this.request.on('error', (error) => reject(error))
      this.request.on('end', () => resolve(Buffer.concat(buffers)))
    })
  }

  /** Reads the body of this request as text */
  public async text(options?: TextDecodeOptions): Promise<string> {
    return Buffer.decode(await this.arrayBuffer(), options)
  }

  /** Reads the body of this request as json */
  public async json<T>(): Promise<T> {
    return JSON.parse(await this.text())
  }

  private readIpAddress(request: IncomingMessage) {
    if (request.headers['x-forwarded-for'] !== undefined) {
      const forwarded = request.headers['x-forwarded-for'] as string
      return forwarded.trim()
    } else if (request.socket.remoteAddress !== undefined) {
      return request.socket.remoteAddress
    } else {
      return '0.0.0.0'
    }
  }

  private readHeaders(request: IncomingMessage) {
    const map = new Map<string, string>()
    for (const [key, value] of Object.entries(request.headers)) {
      if (value === null || value === undefined) {
        map.set(key, '')
      } else if (typeof value === 'string') {
        map.set(key, value)
      } else if (Array.isArray(value)) {
        map.set(key, value.join(', '))
      } else {
        /** ignore */
      }
    }
    return map
  }

  private readQuery(request: IncomingMessage) {
    const map = new Map<string, string>()
    if (request.url === undefined) {
      return map
    }
    const qindex = request.url.indexOf('?')
    if (qindex === -1 || qindex === request.url.length - 1) {
      return map
    }
    const qstring = request.url.slice(qindex + 1)
    for (const [key, value] of Object.entries(this.parseUrl(qstring))) {
      if (value === null || value === undefined) {
        map.set(key, '')
      } else if (typeof value === 'string') {
        map.set(key, value)
      } else if (Array.isArray(value)) {
        map.set(key, value.join(', '))
      } else {
        /** ignore */
      }
    }
    return map
  }

  private readParams(params: Record<string, string>) {
    const map = new Map<string, string>()
    for (const key of Object.keys(params)) {
      map.set(key, params[key])
    }
    return map
  }

  private parseUrl(url: string): object {
    try {
      return parseQueryString(url)
    } catch {
      return {}
    }
  }
}
