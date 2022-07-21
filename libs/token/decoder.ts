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

import { TypeCompiler, TypeCheck, TypeException } from '@sidewinder/type/compiler'
import { verify } from 'jsonwebtoken'
import { TObject } from '@sidewinder/type'
import { Format } from './format'

export class TokenDecoderVerifyError extends Error {
  constructor() {
    super('TokenDecoder cannot verify token with the given publicKey')
  }
}

export class TokenDecoder<Claims extends TObject> {
  private readonly typeCheck: TypeCheck<Claims>

  constructor(private readonly schema: Claims, private readonly publicKey: string) {
    this.publicKey = Format.key(this.publicKey)
    this.typeCheck = TypeCompiler.Compile(this.schema)
  }

  /** Validates the given token and returns the decoded claims + iat */
  private validateToken(token: string): unknown {
    try {
      return verify(token, this.publicKey, { algorithms: ['RS256'] })
    } catch {
      throw new TokenDecoderVerifyError()
    }
  }

  /** Validates the given token is of the correct type */
  private validateType(verified: unknown): Claims['static'] & { iat: number } {
    const check = this.typeCheck.Check(verified)
    if (check) {
      return verified as Claims['static'] & { iat: number }
    } else {
      throw new TypeException('TokenDecoder', this.typeCheck, verified)
    }
  }

  /** Decodes the given token and returns the token type */
  public decode(token: string): Claims['static'] & { iat: number } {
    const verified = this.validateToken(token)
    return this.validateType(verified)
  }
}
