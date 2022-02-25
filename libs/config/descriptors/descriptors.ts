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

export interface Descriptor {
    pointer: string
    type:    'string' | 'number' | 'integer' | 'boolean'
    name:    string
    default: unknown
}

export interface DescriptorOptions {
    format:    (input: string) => string
    prefix:    string
    seperator: string
}

export namespace Descriptors {
    function* object(path: string, name: string, schema: TSchema, options: DescriptorOptions): Iterable<Descriptor> {
        for (const [key, propertySchema] of Object.entries(schema.properties)) {
            yield* visit(`${path}/${key}`, `${name}${options.seperator}${options.format(key)}`, propertySchema as TSchema, options)
        }
    }

    function* primitive(path: string, name: string, schema: TSchema, options: DescriptorOptions): Iterable<Descriptor> {
        yield { type: schema.type, name: options.format(name), pointer: path, default: schema.default }
    }

    function* visit(path: string, name: string, schema: TSchema, options: DescriptorOptions): Iterable<Descriptor> {
        switch (schema.kind) {
            case 'Object': return yield* object(path, name, schema, options)
            case 'Number': return yield* primitive(path, name, schema, options)
            case 'Integer': return yield* primitive(path, name, schema, options)
            case 'String': return yield* primitive(path, name, schema, options)
            case 'Boolean': return yield* primitive(path, name, schema, options)
            case 'RegEx': return yield* primitive(path, name, schema, options)
            case 'Null': return yield* primitive(path, name, schema, options)
        }
    }

    // Resolves property descriptors from the given schema.
    export function* resolve(schema: TObject, options: DescriptorOptions): Iterable<Descriptor> {
        for (const [key, propertySchema] of Object.entries(schema.properties)) {
            yield* visit(`/${key}`, `${options.prefix}${key}`, propertySchema, options)
        }
    }
}