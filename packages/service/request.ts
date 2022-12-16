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

// --------------------------------------------------------------------------
// HeaderKeys
// --------------------------------------------------------------------------

export type HeaderKeys =
  | 'accept'
  | 'accept-language'
  | 'accept-patch'
  | 'accept-ranges'
  | 'access-control-allow-credentials'
  | 'access-control-allow-headers'
  | 'access-control-allow-methods'
  | 'access-control-allow-origin'
  | 'access-control-expose-headers'
  | 'access-control-max-age'
  | 'access-control-request-headers'
  | 'access-control-request-method'
  | 'age'
  | 'allow'
  | 'alt-svc'
  | 'authorization'
  | 'cache-control'
  | 'connection'
  | 'content-disposition'
  | 'content-encoding'
  | 'content-language'
  | 'content-length'
  | 'content-location'
  | 'content-range'
  | 'content-type'
  | 'cookie'
  | 'date'
  | 'etag'
  | 'expect'
  | 'expires'
  | 'forwarded'
  | 'from'
  | 'host'
  | 'if-match'
  | 'if-modified-since'
  | 'if-none-match'
  | 'if-unmodified-since'
  | 'last-modified'
  | 'location'
  | 'origin'
  | 'pragma'
  | 'proxy-authenticate'
  | 'proxy-authorization'
  | 'public-key-pins'
  | 'range'
  | 'referer'
  | 'retry-after'
  | 'sec-websocket-accept'
  | 'sec-websocket-extensions'
  | 'sec-websocket-key'
  | 'sec-websocket-protocol'
  | 'sec-websocket-version'
  | 'set-cookie'
  | 'strict-transport-security'
  | 'tk'
  | 'trailer'
  | 'transfer-encoding'
  | 'upgrade'
  | 'user-agent'
  | 'vary'
  | 'via'
  | 'warning'
  | 'www-authenticate'

export abstract class ServiceRequest {
  /** Gets the remote IP Address */
  abstract get ipAddress(): string

  /** Gets the Http Url */
  abstract get url(): string

  /** Gets the Http method */
  abstract get method(): string

  /** Gets the Http headers */
  abstract get headers(): Map<string, string>

  /** Gets the Http Url Querystring */
  abstract get query(): Map<string, string>

  /** Reads this request as a Uint8Array */
  abstract read(): Promise<Uint8Array>
}
