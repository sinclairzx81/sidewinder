/*--------------------------------------------------------------------------

@sidewinder/client

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

import { TContract } from '@sidewinder/contract'
import { fetch } from '@sidewinder/web'

export namespace Request {
  function createRequiredHeader(contract: TContract, body: Uint8Array) {
    const contentType = contract.format === 'json' ? 'application/json' : 'application/x-msgpack'
    return { 'Content-Type': contentType, 'Content-Length': body.length.toString() }
  }

  function assertResponseType(contract: TContract, endpoint: string, contentType: string) {
    const expectedContentType = contract.format === 'json' ? 'application/json' : 'application/x-msgpack'
    if (contentType !== expectedContentType) {
      throw Error(`Endpoint '${endpoint}' responded with an invalid Content-Type header. Expected '${expectedContentType}' but received '${contentType}'`)
    }
  }

  export async function call(contract: TContract, endpoint: string, additionalHeaders: Record<string, string>, body: Uint8Array): Promise<Uint8Array> {
    const requiredHeaders = createRequiredHeader(contract, body)
    const headers = { ...additionalHeaders, ...requiredHeaders }
    const response = await fetch(endpoint, { method: 'POST', body, headers })
    assertResponseType(contract, endpoint, response.headers.get('Content-Type') as string)
    const arraybuffer = await response.arrayBuffer()
    return new Uint8Array(arraybuffer)
  }
}
