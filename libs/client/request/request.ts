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

import { Platform }  from '@sidewinder/platform'
import { TContract } from '@sidewinder/contract'

export namespace Request {

    function createRequiredHeader(contract: TContract, body: Uint8Array) {
        const contentType = contract.format === 'json' ? 'application/json' : 'application/x-msgpack'
        return { 'Content-Type': contentType, 'Content-Length': body.length.toString() }
    }

    function assertResponseOk(endpoint: string, ok: boolean) {
        if (!ok) {
            throw Error(`Endpoint '${endpoint}' unreachable`)
        }
    }

    function assertResponseType(contract: TContract, endpoint: string, contentType: string) {
        const expectedContentType = contract.format === 'json' ? 'application/json' : 'application/x-msgpack'
        if (contentType !== expectedContentType) {
            throw Error(`Endpoint '${endpoint}' responded with an invalid Content-Type header. Expected '${expectedContentType}' but received '${contentType}'`)
        }
    }

    async function browser(contract: TContract, endpoint: string, additionalHeaders: Record<string, string>, body: Uint8Array) {
        const requiredHeaders = createRequiredHeader(contract, body)
        const headers = { ...additionalHeaders, ...requiredHeaders }
        const response = await fetch(endpoint, { method: 'POST', body, headers })
        assertResponseOk(endpoint, response.ok)
        assertResponseType(contract, endpoint, response.headers.get('Content-Type') as string)
        const arraybuffer = await response.arrayBuffer()
        return new Uint8Array(arraybuffer)
    }

    function dynamicImport<T = any>(name: string): T {
        return (new Function('require', 'name', 'return require(name)'))(require, name)
    }

    /** 
     * NodeJS Fallback. We use the core API to carry out the request as pretty much
     * every fetch polyfill library for node breaks esbuild dependency resolution. We
     * use lazy require() in this function to avoid esbuild inserting these imports
     * when bundling. Replace with actual fetch in Node v18.x
     */
    function node(contract: TContract, endpoint: string, additionalHeaders: Record<string, string>, body: Uint8Array) {
        return new Promise<Uint8Array>((resolve, reject) => {
            const urlObject = dynamicImport('url').parse(endpoint)
            const http = urlObject.protocol === 'https:' ? dynamicImport('https') : dynamicImport('http')
            const requiredHeaders = createRequiredHeader(contract, body)
            const headers = { ...additionalHeaders, ...requiredHeaders }
            const request =  http.request({ method: 'POST', headers, ...urlObject }, (res: any) => {
                try {
                    assertResponseType(contract, endpoint, res.headers['content-type'])
                } catch (error) {
                    return reject(error)
                }
                const buffers: Buffer[] = []
                res.on('data', (buffer: Buffer) => buffers.push(buffer))
                res.on('error', (error: Error) => reject(error))
                res.on('end', () => resolve(Buffer.concat(buffers)))
            })
            request.on('error', (error: Error) => reject(error))
            const version = Platform.version()
            if(version.major < 16) { // Node 14: Fallback
                request.end(Buffer.from(body))
            } else {
                request.end(body)
            }
        })
    }

    export async function call(contract: TContract, endpoint: string, additionalHeaders: Record<string, string>, body: Uint8Array): Promise<Uint8Array> {
        return Platform.platform() === 'browser'
            ? await browser(contract, endpoint, additionalHeaders, body)
            : await node(contract, endpoint, additionalHeaders, body)
    }
}