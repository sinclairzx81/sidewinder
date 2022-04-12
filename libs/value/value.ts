/*--------------------------------------------------------------------------

@sidewinder/value

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

import { TSchema, Static } from '@sidewinder/type'
import { CreateValue } from './create'
import { PatchValue } from './patch'
import { CheckValue } from './check'

export namespace Value {
  /** Creates a default value from the given schema type */
  export function Create<T extends TSchema>(schema: T): Static<T> {
    return CreateValue.Create(schema)
  }

  /** Patches a value to match the given schema while preserving as much information in the value as possible. */
  export function Patch<T extends TSchema>(schema: T, value: any): Static<T> {
    return PatchValue.Create(schema, value)
  }

  /** Checks if the given value matches the given schema */
  export function Check<T extends TSchema>(schema: T, value: any): value is Static<T> {
    return CheckValue.Check(schema, value)
  }
}
