/*--------------------------------------------------------------------------

@sidewinder/validation

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

import { TSchema } from '@sidewinder/types'
import { Compiler, ValidateFunction } from './compiler'

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
}

/** Provides runtime validation for Sidewinder Types */
export class Validator<T extends TSchema> {
    private readonly validateFunction: ValidateFunction<unknown>
    constructor(private readonly schema: T, private readonly additionalSchema: TSchema[] = []) { 
        this.validateFunction = Compiler.compile(this.schema, this.additionalSchema)
    }

    /** Check if the given data conforms to this validators schema. */
    public check(data: unknown): ValidateResult {
        const result = this.validateFunction(data)
        if(!result) {
            const errors = this.validateFunction.errors ? this.validateFunction.errors : []
            return { success: false, errors }
        } else {
            return { success: true, errors: [] }
        }
    }

    /** Asserts if the given data conforms to this validators schema. */
    public assert(data: unknown): data is T {
        const result = this.check(data)
        if(!result.success) throw new ValidateError(result.errors)
        return true
    }
}