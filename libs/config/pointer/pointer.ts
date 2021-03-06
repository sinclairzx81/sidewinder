/*--------------------------------------------------------------------------

@sidewinder/config

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

/** Read Write Operations on a Object via JSON Pointer */
export namespace JsonPointer {
  /** Formats the RFC6901 JsonPointer as an array of paths. */
  function format(pointer: string) {
    return pointer
      .split(`/`)
      .filter((part) => part.length > 0)
      .map((part) => part.replace(/~0/g, `~`).replace(/~1/g, `/`))
  }

  /** Sets the value at the given pointer. If the pointer does not exist it is created. */
  export function set(target: unknown, pointer: string, value: unknown) {
    if (pointer === '/') return (target as any)['']
    if (pointer === '') return target
    const path = format(pointer)
    let current: any = target
    while (path.length > 1) {
      const next = path.shift()!
      if (current[next] === undefined) current[next] = {}
      current = current[next]
    }
    current[path.shift()!] = value
  }

  /** Deletes a value at the given pointer. */
  export function del(target: unknown, pointer: string) {
    if (pointer === '/') return (target as any)['']
    if (pointer === '') return target
    let current: any = target
    const path = format(pointer)
    while (path.length > 1) {
      const next = path.shift()!
      if (current[next] === undefined) return
      current = current[next]
    }
    delete current[path.shift()!]
  }

  /** True if a value exists at the given pointer */
  export function has(target: unknown, pointer: string) {
    if (pointer === '/') return (target as any)['']
    if (pointer === '') return target
    let current: any = target
    const path = format(pointer)
    while (path.length > 1) {
      const next = path.shift()!
      if (current[next] === undefined) return false
      current = current[next]
    }
    return current[path.shift()!] !== undefined
  }

  /** Gets the value at the given pointer */
  export function get(target: unknown, pointer: string) {
    if (pointer === '/') return (target as any)['']
    if (pointer === '') return target
    let current: any = target
    const path = format(pointer)
    while (path.length > 1) {
      const next = path.shift()!
      if (current[next] === undefined) return undefined
      current = current[next]
    }
    return current[path.shift()!]
  }
}
