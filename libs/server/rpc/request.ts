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

import { IncomingMessage } from 'http'
import { parse as parseQueryString } from 'qs'
import { ReadonlyMap, HttpHeaderKeys } from '../http/index'

/**
 * Request type passed to WebService and WebSocketService authorize handlers. This
 * type only provides access to the requests headers and querystring parameters.
 */
export class Request {
  private readonly internalIpAddress: string
  private readonly internalHeaders: Map<string, string>
  private readonly internalQuery: Map<string, string>

  constructor(request: IncomingMessage) {
    this.internalIpAddress = this.readIpAddress(request)
    this.internalHeaders = this.readHeaders(request)
    this.internalQuery = this.readQuery(request)
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

  private parseUrl(url: string): object {
    try {
      return parseQueryString(url)
    } catch {
      return {}
    }
  }
}
