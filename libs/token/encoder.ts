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

import { sign } from 'jsonwebtoken'
import { TObject } from '@sidewinder/type'
import { Validator } from '@sidewinder/validator'
import { Format } from './format'

export class TokenEncoderTypeError extends Error {
  constructor(public readonly errors: any[], errorText: string) {
    super(`TokenEncoder failed to type check. ${errorText}`)
  }
}

export class TokenEncoder<Claims extends TObject> {
  private readonly tokenValidator: Validator<Claims>

  constructor(private readonly schema: Claims, private readonly privateKey: string) {
    this.privateKey = Format.key(this.privateKey)
    this.tokenValidator = new Validator(this.schema)
  }

  private validateType(token: Claims['$static']) {
    const check = this.tokenValidator.check(token)
    if (!check.success) {
      throw new TokenEncoderTypeError(check.errors, check.errorText)
    } else {
      return token as Claims['$static'] & { iat: number }
    }
  }

  /** Encodes the given claims and returns a string token */
  public encode(claims: Claims['$static']): string {
    const checked = this.validateType(claims)
    return sign(checked, this.privateKey, { algorithm: 'RS256' })
  }
}
