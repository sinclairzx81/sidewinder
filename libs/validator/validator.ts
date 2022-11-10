/*--------------------------------------------------------------------------

@sidewinder/validator

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

import { TypeCompiler, TypeCheck } from '@sidewinder/type/compiler'
import { TSchema } from '@sidewinder/type'

/** The Error type thrown on validator assert. */
export class ValidateError extends Error {
  constructor(public readonly errors: any[]) {
    super('Data did not to validate')
  }
}

/** The return type for validate check. */
export interface ValidateResult {
  success: boolean
  errors: any[]
  errorText: string
}

/** Provides runtime validation for Sidewinder Types */
export class Validator<T extends TSchema> {
  private readonly typeCheck: TypeCheck<T>
  constructor(schema: T, references: TSchema[] = []) {
    this.typeCheck = TypeCompiler.Compile(schema, references)
  }

  /** Check if the given data conforms to this validators schema. */
  public check(value: unknown): ValidateResult {
    if (this.typeCheck.Check(value)) return { success: true, errors: [], errorText: '' }
    const errors = [...this.typeCheck.Errors(value)]
    const errorText = errors.map((error) => `'${error.path}': ${error.message}`).join(' ')
    return { success: false, errors, errorText }
  }

  /** Asserts if the given data conforms to this validators schema. */
  public assert(data: unknown): data is T {
    const result = this.check(data)
    if (!result.success) throw new ValidateError(result.errors)
    return true
  }
}
