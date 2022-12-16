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

import { ServerResponse } from 'node:http'
import { ServiceResponse } from '@sidewinder/service'
import { Platform } from '@sidewinder/platform'

export class NodeServiceResponse extends ServiceResponse {
  readonly #response: ServerResponse
  constructor(response: ServerResponse) {
    super()
    this.#response = response
  }

  public writeHead(status: number, statusText: string, headers: Record<string, any>): void {
    this.#response.writeHead(status, statusText, headers)
  }

  public write(buffer: Uint8Array): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.#response.on('error', (error) => reject(error))
      const version = Platform.version()
      if (version.major < 16) {
        this.#response.write(Buffer.from(buffer), () => resolve())
      } else {
        this.#response.write(buffer, () => resolve())
      }
    })
  }

  public end(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.#response.on('error', (error) => reject(error))
      this.#response.end(() => resolve())
    })
  }
}
