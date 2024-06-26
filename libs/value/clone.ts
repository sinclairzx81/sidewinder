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

import { ValueGuard, ObjectType, ArrayType, TypedArrayType, ValueType } from './guard'

export namespace ValueClone {
  function Array(value: ArrayType): any {
    return value.map((element: any) => Clone(element))
  }

  function Date(value: Date): any {
    return new globalThis.Date(value.toISOString())
  }

  function Object(value: ObjectType): any {
    const keys = [...globalThis.Object.keys(value), ...globalThis.Object.getOwnPropertySymbols(value)]
    return keys.reduce((acc, key) => ({ ...acc, [key]: Clone(value[key]) }), {})
  }

  function TypedArray(value: TypedArrayType): any {
    return value.slice()
  }

  function Value(value: ValueType): any {
    return value
  }

  export function Clone<T extends unknown>(value: T): T {
    if (ValueGuard.IsDate(value)) {
      return Date(value)
    } else if (ValueGuard.IsObject(value)) {
      return Object(value)
    } else if (ValueGuard.IsArray(value)) {
      return Array(value)
    } else if (ValueGuard.IsTypedArray(value)) {
      return TypedArray(value)
    } else if (ValueGuard.IsValueType(value)) {
      return Value(value)
    } else {
      throw new Error('ValueClone: Unable to clone value')
    }
  }
}
