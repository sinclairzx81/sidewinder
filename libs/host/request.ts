/*--------------------------------------------------------------------------

@sidewinder/host

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

import { IncomingMessage } from 'node:http'
import { ServiceRequest } from '@sidewinder/service'
import { Buffer } from '@sidewinder/buffer'
import * as qs from 'qs'

export class NodeServiceRequest extends ServiceRequest {
  readonly #request: IncomingMessage
  readonly #ipAddress: string
  readonly #headers: Map<string, string>
  readonly #query: Map<string, string>

  constructor(request: IncomingMessage) {
    super()
    this.#request = request
    this.#ipAddress = this.#readIpAddress(request)
    this.#headers = this.#readHeaders(request)
    this.#query = this.#readQuery(request)
  }

  public get url(): string {
    return this.#request.url || '/'
  }

  public get ipAddress(): string {
    return this.#ipAddress
  }

  public get method(): string {
    return this.#request.method !== undefined ? this.#request.method.toLowerCase() : 'unknown'
  }

  public get headers(): Map<string, string> {
    return this.#headers
  }

  public get query(): Map<string, string> {
    return this.#query
  }

  public buffer(): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      const buffers: Buffer[] = []
      this.#request.on('error', (error) => reject(error))
      this.#request.on('data', (buffer) => buffers.push(buffer))
      this.#request.on('end', () => resolve(Buffer.concat(buffers)))
    })
  }

  // ------------------------------------------------------------------------------
  // Privates
  // ------------------------------------------------------------------------------

  #readIpAddress(request: IncomingMessage) {
    if (request.headers['x-forwarded-for'] !== undefined) {
      const forwarded = request.headers['x-forwarded-for'] as string
      return forwarded.trim()
    } else if (request.socket.remoteAddress !== undefined) {
      return request.socket.remoteAddress
    } else {
      return '0.0.0.0'
    }
  }

  #readHeaders(request: IncomingMessage) {
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

  #readQuery(request: IncomingMessage) {
    const map = new Map<string, string>()
    if (request.url === undefined) {
      return map
    }
    const qindex = request.url.indexOf('?')
    if (qindex === -1 || qindex === request.url.length - 1) {
      return map
    }
    const qstring = request.url.slice(qindex + 1)
    for (const [key, value] of Object.entries(this.#parseUrl(qstring))) {
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

  #parseUrl(url: string): object {
    try {
      return qs.parse(url)
    } catch {
      return {}
    }
  }
}
