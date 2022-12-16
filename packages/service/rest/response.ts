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
import { ServiceResponse } from '../response'

export class RestResponse {
  #headers: Record<string, string>
  #status: number = 200
  #statusText: string = ''

  constructor(private readonly response: ServiceResponse) {
    this.#headers = {}
    this.#status = 200
    this.#statusText = ''
  }

  // ------------------------------------------------------------------------------
  // Publics
  // ------------------------------------------------------------------------------

  /** Sets the status text for this response. */
  public statusText(statusText: string): this {
    this.#statusText = statusText
    return this
  }

  /** Sets the status code for this response. */
  public status(status: number): this {
    this.#status = status
    return this
  }

  /** Sets the http headers for this response. */
  public headers(headers: Record<string, string | number>) {
    this.#headers = Object.keys(headers).reduce((acc, key) => {
      return { ...acc, [key]: headers[key].toString() }
    }, {})
    return this
  }

  /** Ends this request by sending the given Uint8Array buffer on the response */
  public async arrayBuffer(buffer: Uint8Array, contentType: string = 'text/plain'): Promise<void> {
    await this.#internalWriteHead(this.#status, this.#statusText, {
      ...this.#headers,
      'Content-Type': contentType,
      'Content-Length': buffer.length.toString(),
    })
    await this.#internalWrite(buffer)
    await this.#internalEnd()
  }

  /** Ends this request by sending a text response */
  public async text(content: string, contentType: string = 'text/plain'): Promise<void> {
    const buffer = Buffer.encode(content)
    await this.arrayBuffer(buffer)
  }

  /** Ends this request by sending a json response */
  public async json<T = unknown>(data: T): Promise<void> {
    return await this.text(JSON.stringify(data), 'application/json')
  }

  /** Ends this request by sending a html response */
  public async html(html: string): Promise<void> {
    return await this.text(html, 'text/html')
  }

  // ------------------------------------------------------------------------------
  // Privates
  // ------------------------------------------------------------------------------

  async #internalWriteHead(status: number, statusText: string = '', headers: Record<string, string> = {}): Promise<void> {
    this.response.writeHead(status, statusText, headers)
  }

  async #internalWrite(data: Uint8Array): Promise<void> {
    await this.response.write(data)
  }

  async #internalEnd(): Promise<void> {
    await this.response.end()
  }
}
