/*--------------------------------------------------------------------------

@sidewinder/token

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

import { verify } from 'jsonwebtoken'
import { TObject, TUnion } from '@sidewinder/type'
import { Validator } from '@sidewinder/validator'
import { Format } from './format'
import * as crypto from 'node:crypto'

export class TokenDecoderDecryptError extends Error {
  constructor() {
    super('TokenDecoder: Unable decrypt token')
  }
}

export class TokenDecoderVerifyError extends Error {
  constructor() {
    super('TokenDecoder: cannot verify token')
  }
}

export class TokenDecoderTypeError extends Error {
  constructor(public readonly errors: any[], errorText: string) {
    super(`TokenDecoder: Decoded data failed to type check. ${errorText}`)
  }
}

export interface TokenDecoderOptions {
  useEncryption: boolean
}

export class TokenDecoder<Claims extends TObject | TUnion<TObject[]>> {
  private readonly tokenValidator: Validator<Claims>

  constructor(private readonly schema: Claims, private readonly publicKey: string, private readonly options: TokenDecoderOptions = { useEncryption: false }) {
    this.publicKey = Format.key(this.publicKey)
    this.tokenValidator = new Validator(this.schema)
  }

  // ---------------------------------------------------------
  // Type Validation
  // ---------------------------------------------------------

  #validateType(verified: unknown): Claims['static'] & { iat: number } {
    const check = this.tokenValidator.check(verified)
    if (!check.success) {
      throw new TokenDecoderTypeError(check.errors, check.errorText)
    } else {
      return verified as Claims['static'] & { iat: number }
    }
  }

  // ---------------------------------------------------------
  // Token Validation
  // ---------------------------------------------------------

  /** Validates the given token and returns the decoded claims + iat */
  #validateToken(token: string): unknown {
    try {
      return verify(token, this.publicKey, { algorithms: ['RS256'] })
    } catch {
      throw new TokenDecoderVerifyError()
    }
  }

  // ---------------------------------------------------------
  // Decryption
  // ---------------------------------------------------------

  *#chunk(encrypted: string): IterableIterator<Uint8Array> {
    for (const chunk of encrypted.split('.')) {
      yield Buffer.from(chunk, 'base64')
    }
  }

  #decrypt(encrypted: string): string {
    try {
      return [...this.#chunk(encrypted)]
        .map((buffer) => crypto.publicDecrypt(this.publicKey, buffer).toString('utf-8'))
        .join('')
        .trim()
    } catch (error) {
      throw new TokenDecoderDecryptError()
    }
  }

  // ---------------------------------------------------------
  // Decode
  // ---------------------------------------------------------

  /** Decodes the given token and returns the token type */
  public decode(value: string): Claims['static'] & { iat: number } {
    const token = this.options.useEncryption ? this.#decrypt(value) : value
    const verified = this.#validateToken(token)
    return this.#validateType(verified)
  }
}
