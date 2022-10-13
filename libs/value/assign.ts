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

import { Is, TypedArrayType } from './is'
import { ValuePointer } from './pointer'

export class ValueAssignMismatchError extends Error {
  constructor() {
    super('ValueAssign: Cannot assign next on current due to type mismatch')
  }
}

export class ValueAssignInvalidAssignmentType extends Error {
  constructor() {
    super('ValueAssign: Can only assign object and array types')
  }
}

export type Assignable = { [key: string]: unknown } | unknown[]

export namespace ValueAssign {
  export function Object(root: Assignable, path: string, current: unknown, next: Record<string, unknown>) {
    if (!Is.Object(current)) {
      ValuePointer.Set(root, path, next)
    } else {
      const currentKeys = globalThis.Object.keys(current)
      const nextKeys = globalThis.Object.keys(next)
      for (const currentKey of currentKeys) {
        if (!nextKeys.includes(currentKey)) {
          delete current[currentKey]
        }
      }
      for (const nextKey of nextKeys) {
        if (!currentKeys.includes(nextKey)) {
          current[nextKey] = null
        }
      }
      for (const nextKey of nextKeys) {
        Visit(root, `${path}/${nextKey}`, current[nextKey], next[nextKey])
      }
    }
  }

  function Array(root: Assignable, path: string, current: unknown, next: unknown[]) {
    if (!Is.Array(current)) {
      ValuePointer.Set(root, path, next)
    } else {
      for (let index = 0; index < next.length; index++) {
        Visit(root, `${path}/${index}`, current[index], next[index])
      }
      current.splice(next.length)
    }
  }

  function TypedArray(root: Assignable, path: string, current: unknown, next: TypedArrayType) {
    ValuePointer.Set(root, path, next)
  }

  function Value(root: Assignable, path: string, current: unknown, next: unknown) {
    ValuePointer.Set(root, path, next)
  }

  function Visit(root: Assignable, path: string, current: unknown, next: unknown) {
    if (Is.Array(next)) {
      return Array(root, path, current, next)
    } else if (Is.TypedArray(next)) {
      return TypedArray(root, path, current, next)
    } else if (Is.Object(next)) {
      return Object(root, path, current, next)
    } else if (Is.Value(next)) {
      return Value(root, path, current, next)
    }
  }

  /** Performs a deep mutable assignment writing the values of next on the current value. */
  export function Assign(current: Assignable, next: Assignable): void {
    if (Is.TypedArray(current) || Is.Value(current) || Is.TypedArray(next) || Is.Value(next)) {
      throw new ValueAssignInvalidAssignmentType()
    }
    if ((Is.Object(current) && Is.Array(next)) || (Is.Array(current) && Is.Object(next))) {
      throw new ValueAssignMismatchError()
    }
    Visit(current, '', current, next)
  }
}
