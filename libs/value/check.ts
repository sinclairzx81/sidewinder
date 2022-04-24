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

import * as Types from '@sidewinder/type'

export namespace CheckValue {
  // -----------------------------------------------------
  // Required to defer recursive type validation
  // -----------------------------------------------------
  const dynamicAnchors = new Map<string, Types.TObject>()

  function Any(schema: Types.TAny, value: any): boolean {
    return true
  }

  function Array(schema: Types.TArray, value: any): boolean {
    if (typeof value !== 'object' || !globalThis.Array.isArray(value)) return false
    return value.every((element) => Check(schema.items, element))
  }

  function Boolean(schema: Types.TBoolean, value: any): boolean {
    return typeof value === 'boolean'
  }

  function Constructor(schema: Types.TConstructor, value: any): boolean {
    const required = new Set(schema.returns.required || [])
    return globalThis.Object.entries(schema.returns.properties).every(([key, schema]) => {
      if (!required.has(key) && value.prototype[key] === undefined) return true
      return Check(schema, value.prototype[key])
    })
  }

  function Enum(schema: Types.TEnum<any>, value: any): boolean {
    return schema.anyOf.some((schema) => schema.const === value)
  }

  function Function(schema: Types.TFunction, value: any): boolean {
    return typeof value === 'function'
  }

  function Integer(schema: Types.TInteger, value: any): boolean {
    return typeof value === 'number' && globalThis.Number.isInteger(value)
  }

  function Intersect(schema: Types.TIntersect, value: any): boolean {
    return Object(schema, value)
  }

  function KeyOf(schema: Types.TKeyOf<any>, value: any): boolean {
    const keys = schema.enum as any as any[]
    return keys.includes(value)
  }

  function Literal(schema: Types.TLiteral, value: any): boolean {
    return schema.const === value
  }

  function Null(schema: Types.TNull, value: any): boolean {
    return value === null
  }

  function Number(schema: Types.TNumber, value: any): boolean {
    return typeof value === 'number'
  }

  function Object(schema: Types.TObject, value: any): boolean {
    if (typeof value !== 'object') return false
    if (value === null) return false
    const required = new Set<string>(schema.required || [])
    if (schema['$dynamicAnchor'] !== undefined) dynamicAnchors.set(schema['$dynamicAnchor'], schema)
    return globalThis.Object.entries(schema.properties).every(([key, schema]) => {
      if (!required.has(key) && value[key] === undefined) return true
      return Check(schema, value[key])
    })
  }

  function Promise(schema: Types.TPromise<any>, value: any): boolean {
    return typeof value === 'object' && typeof value['then'] === 'function'
  }

  function Record(schema: Types.TRecord<any, any>, value: any): boolean {
    if (value === null || typeof value !== 'object') return false
    return globalThis.Object.entries(value).every(([key, value]) => {
      const subschema = globalThis.Object.values(schema.patternProperties)[0]
      return Check(subschema, value)
    })
  }

  function Rec(schema: Types.TRec<any>, value: any): boolean {
    throw new Error('Cannot typeof recursive types')
  }

  function Ref(schema: Types.TRef<any>, value: any): boolean {
    throw new Error('Cannot typeof reference types')
  }

  function Self(schema: Types.TSelf, value: any): any {
    const dynamicAnchor = schema.$dynamicRef.replace('#/', '')
    if (!dynamicAnchors.has(dynamicAnchor)) throw new Error('Cannot locate dynamic anchor for self referenced type')
    const self = dynamicAnchors.get(dynamicAnchor)!
    return Object(self, value)
  }

  function String(schema: Types.TString, value: any): boolean {
    if (typeof value !== 'string') return false
    if (schema.pattern !== undefined) {
      const regex = new RegExp(schema.pattern)
      return value.match(regex) !== null
    }
    return true
  }

  function Tuple(schema: Types.TTuple<any[]>, value: any): boolean {
    if (typeof value !== 'object' || !globalThis.Array.isArray(value)) return false
    if (schema.prefixItems === undefined && value.length === 0) return true
    if (schema.prefixItems === undefined) return false
    if (value.length < schema.minItems || value.length > schema.maxItems) return false
    return schema.prefixItems.every((schema, index) => Check(schema, value[index]))
  }

  function Undefined(schema: Types.TUndefined, value: any): boolean {
    return value === undefined
  }

  function Union(schema: Types.TUnion<any[]>, value: any): boolean {
    return schema.anyOf.some((schema) => Check(schema, value))
  }

  function Uint8Array(schema: Types.TUint8Array, value: any): boolean {
    return value instanceof globalThis.Uint8Array
  }

  function Unknown(schema: Types.TUnknown, value: any): boolean {
    return true
  }

  function Void(schema: Types.TVoid, value: any): any {
    return value === null
  }

  export function Check<T extends Types.TSchema>(schema: T, value: any): boolean {
    const anySchema = schema as any
    switch (anySchema.kind) {
      case 'Any':
        return Any(anySchema, value)
      case 'Array':
        return Array(anySchema, value)
      case 'Boolean':
        return Boolean(anySchema, value)
      case 'Constructor':
        return Constructor(anySchema, value)
      case 'Enum':
        return Enum(anySchema, value)
      case 'Function':
        return Function(anySchema, value)
      case 'Integer':
        return Integer(anySchema, value)
      case 'Intersect':
        return Intersect(anySchema, value)
      case 'KeyOf':
        return KeyOf(anySchema, value)
      case 'Literal':
        return Literal(anySchema, value)
      case 'Null':
        return Null(anySchema, value)
      case 'Number':
        return Number(anySchema, value)
      case 'Object':
        return Object(anySchema, value)
      case 'Promise':
        return Promise(anySchema, value)
      case 'Record':
        return Record(anySchema, value)
      case 'Rec':
        return Rec(anySchema, value)
      case 'Ref':
        return Ref(anySchema, value)
      case 'Self':
        return Self(anySchema, value)
      case 'String':
        return String(anySchema, value)
      case 'Tuple':
        return Tuple(anySchema, value)
      case 'Undefined':
        return Undefined(anySchema, value)
      case 'Union':
        return Union(anySchema, value)
      case 'Uint8Array':
        return Uint8Array(anySchema, value)
      case 'Unknown':
        return Unknown(anySchema, value)
      case 'Void':
        return Void(anySchema, value)
      default:
        throw Error(`Unknown schema kind '${schema.kind}'`)
    }
  }
}
