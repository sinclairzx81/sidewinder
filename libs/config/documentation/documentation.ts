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

import { TObject, TSchema } from '@sidewinder/type'

export namespace Documentation {
  function argName(path: string[]) {
    const gray = '\x1b[90m'
    const esc = `\x1b[0m`
    return `${gray}${
      '--' +
      path
        .map((part) => part.toLowerCase())
        .join('-')
        .trim()
        .padEnd(12)
    }${esc}`
  }

  function envName(path: string[]) {
    return path
      .map((part) => part.toUpperCase())
      .join('_')
      .trim()
      .padEnd(12)
  }
  function typeName(type: string, optional: boolean) {
    const blue = '\x1b[36m'
    const esc = `\x1b[0m`
    return `${blue}${type}${optional ? '?' : ''}${esc}`.padEnd(18)
  }
  function* object(key: string, path: string[], schema: TSchema): Iterable<string> {
    for (const [key, propertySchema] of Object.entries(schema.properties)) {
      yield* visit(key, [...path, key], propertySchema as TSchema)
    }
  }

  function* primitive(key: string, path: string[], schema: TSchema): Iterable<string> {
    const optional = schema.default !== undefined || schema.modifier === 'Optional' || schema.modifier === 'ReadonlyOptional'
    const description = schema.description !== undefined ? schema.description : ''
    const line = [`${argName(path)}`, `${envName(path)}`, `${typeName(schema.type, optional)}`, `${description}`].filter((segment) => segment.length > 0).join(' ')
    yield `  ${line}`
  }

  function* visit(key: string, path: string[], schema: TSchema): Iterable<string> {
    switch (schema.kind) {
      case 'Object':
        return yield* object(key, path, schema)
      case 'Number':
        return yield* primitive(key, path, schema)
      case 'Integer':
        return yield* primitive(key, path, schema)
      case 'String':
        return yield* primitive(key, path, schema)
      case 'Boolean':
        return yield* primitive(key, path, schema)
      case 'RegEx':
        return yield* primitive(key, path, schema)
      case 'Null':
        return yield* primitive(key, path, schema)
    }
  }

  // Resolves property descriptors from the given schema.
  export function* gather(schema: TObject): Iterable<string> {
    for (const [key, propertySchema] of Object.entries(schema.properties)) {
      yield* visit(key, [key], propertySchema)
    }
  }

  export function resolve(schema: TObject): string {
    return ['Options:', '', ...gather(schema)].join('\n')
  }
}
