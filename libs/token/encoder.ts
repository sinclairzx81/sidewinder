/*--------------------------------------------------------------------------

@sidewinder/token

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

import { sign } from 'jsonwebtoken'
import { TObject, TUnion } from '@sidewinder/type'
import { Validator } from '@sidewinder/validator'
import { Format } from './format'
import * as crypto from 'node:crypto'

export class TokenEncoderTypeError extends Error {
  constructor(public readonly errors: any[], errorText: string) {
    super(`TokenEncoder failed to type check. ${errorText}`)
  }
}

export interface TokenEncoderOptions {
  useEncryption: boolean
}

export class TokenEncoder<Claims extends TObject | TUnion<TObject[]>> {
  private readonly tokenValidator: Validator<Claims>

  constructor(private readonly schema: Claims, private readonly privateKey: string, private readonly options: TokenEncoderOptions = { useEncryption: false }) {
    this.privateKey = Format.key(this.privateKey)
    this.tokenValidator = new Validator(this.schema)
  }

  // ---------------------------------------------------------
  // Type Verification
  // ---------------------------------------------------------

  #validateType(token: Claims['static']) {
    const check = this.tokenValidator.check(token)
    if (!check.success) {
      throw new TokenEncoderTypeError(check.errors, check.errorText)
    } else {
      return token as Claims['static'] & { iat: number }
    }
  }

  // ---------------------------------------------------------
  // Encryption
  // ---------------------------------------------------------

  // Segments this string into buffers under the RSA_padding_add_PKCS1_type_1 length. These
  // buffers are encrypted individually, mapped to base64 then concatinated with a period
  // delimiter (inline with jsonwebtoken delimiting)
  *#chunk(encoded: string): IterableIterator<Uint8Array> {
    const buffer = Buffer.from(encoded)
    const length = 200
    let index = 0
    while (index < buffer.length) {
      yield buffer.subarray(index, index + length)
      index += length
    }
  }

  #encrypt(encoded: string): string {
    return [...this.#chunk(encoded)].map((buffer) => crypto.privateEncrypt(this.privateKey, buffer).toString('base64')).join('.')
  }

  // ---------------------------------------------------------
  // Encode
  // ---------------------------------------------------------

  /** Encodes the given claims and returns a string token */
  public encode(claims: Claims['static']): string {
    const checked = this.#validateType(claims)
    const signed = sign(checked, this.privateKey, { algorithm: 'RS256' })
    return this.options.useEncryption ? this.#encrypt(signed) : signed
  }
}
