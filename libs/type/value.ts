/*--------------------------------------------------------------------------

@sidewinder/type

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

import * as Types from './type'

/** Creates default values from types */
export namespace Value {
  /** Creates an any value. */
  export function Any(schema: Types.TAny): unknown {
    if (schema.default !== undefined) {
      return schema.default
    } else {
      return {}
    }
  }

  /** Creates an array value */
  export function Array(schema: Types.TArray): unknown[] {
    if (schema.default !== undefined) {
      return schema.default
    } else if (schema.minItems !== undefined) {
      return globalThis.Array.from({ length: schema.minItems }).map((item) => Value.Create(schema.items))
    } else {
      return []
    }
  }

  /** Creates a boolean value */
  export function Boolean(schema: Types.TBoolean): unknown {
    if (schema.default !== undefined) {
      return schema.default
    } else {
      return false
    }
  }

  /** Creates a constructor value */
  export function Constructor(schema: Types.TConstructor): unknown {
    if (schema.default !== undefined) {
      return schema.default
    } else {
      const value = Value.Create(schema.returns) as any
      if (typeof value === 'object' && !globalThis.Array.isArray(value)) {
        return class {
          constructor() {
            for (const [key, val] of globalThis.Object.entries(value)) {
              const facade: any = this
              facade[key] = val
            }
          }
        }
      } else {
        return class {}
      }
    }
  }

  /** Creates an enum value */
  export function Enum(schema: Types.TEnum<any>): unknown {
    if (schema.default !== undefined) {
      return schema.default
    } else if (schema.anyOf.length === 0) {
      throw new Error('Cannot generate Enum with no set')
    } else {
      return schema.anyOf[0].const
    }
  }

  /** Creates a function value */
  export function Function(schema: Types.TFunction): unknown {
    if (schema.default !== undefined) {
      return schema.default
    } else {
      return () => Value.Create(schema.returns)
    }
  }

  /** Creates a integer value */
  export function Integer(schema: Types.TInteger): unknown {
    if (schema.default !== undefined) {
      return schema.default
    } else if (schema.minimum) {
      return Math.floor(schema.minimum)
    } else {
      return 0
    }
  }

  /** Creates a intersect value */
  export function Intersect(schema: Types.TIntersect): unknown {
    if (schema.default !== undefined) {
      return schema.default
    } else {
      return (
        schema.default ||
        globalThis.Object.entries(schema.properties).reduce((acc, [key, schema]) => {
          return { ...acc, [key]: Value.Create(schema as Types.TSchema) }
        }, {})
      )
    }
  }

  /** Creates a keyof value */
  export function KeyOf(schema: Types.TKeyOf<any>): unknown {
    if (schema.default !== undefined) {
      return schema.default
    } else {
      return (schema.enum as any)[0]
    }
  }

  /** Creates a literal value */
  export function Literal(schema: Types.TLiteral): unknown {
    return schema.const
  }

  /** Creates a namespace value */
  export function Namespace(schema: Types.TNamespace): unknown {
    if (schema.default === undefined) {
      return schema.default
    } else {
      throw new Error('Namespace types require a default value')
    }
  }

  /** Creates a null value */
  export function Null(schema: Types.TNull): unknown {
    return null
  }

  /** Creates a number value */
  export function Number(schema: Types.TNumber): unknown {
    if (schema.default !== undefined) {
      return schema.default
    } else if (schema.minimum !== undefined) {
      return schema.minimum
    } else {
      return 0
    }
  }

  /** Creates a object value */
  export function Object(schema: Types.TObject): object {
    if (schema.default !== undefined) {
      return schema.default
    } else {
      return (
        schema.default ||
        globalThis.Object.entries(schema.properties).reduce((acc, [key, schema]) => {
          return { ...acc, [key]: Value.Create(schema) }
        }, {})
      )
    }
  }

  /** Creates a promise value */
  export function Promise(schema: Types.TSchema) {
    if (schema.default !== undefined) {
      return schema.default
    } else {
      return globalThis.Promise.resolve(Value.Create(schema))
    }
  }

  /** Creates a record value */
  export function Record(schema: Types.TRecord<any, any>): object {
    if (schema.default !== undefined) {
      return schema.default
    } else {
      return {}
    }
  }

  /** Creates a recursive value */
  export function Rec(schema: Types.TRec<any>): unknown {
    if (schema.default !== undefined) {
      return schema.default
    } else {
      throw new Error('Rec types require a default value')
    }
  }

  /** Creates a referenced value */
  export function Ref(schema: Types.TRef<any>): unknown {
    if (schema.default !== undefined) {
      return schema.default
    } else {
      throw new Error('Ref types require a default value')
    }
  }

  /** Creates a regex value */
  export function RegEx(schema: Types.TRegEx): unknown {
    if (schema.default !== undefined) {
      return schema.default
    } else {
      throw new Error('RegEx types require a default value')
    }
  }

  /** Creates a string value */
  export function String(schema: Types.TString): unknown {
    if (schema.default !== undefined) {
      return schema.default
    } else {
      return ''
    }
  }

  /** Creates a tuple value */
  export function Tuple(schema: Types.TTuple<any[]>): unknown[] {
    if (schema.default !== undefined) {
      return schema.default
    } else {
      return globalThis.Array.from({ length: schema.minItems }).map((_, index) => Value.Create((schema.items as any[])[index]))
    }
  }

  /** Creates an undefined value */
  export function Undefined(schema: Types.TUndefined): undefined {
    return undefined
  }

  /** Creates a union value */
  export function Union(schema: Types.TUnion<any[]>): unknown {
    if (schema.default !== undefined) {
      return schema.default
    } else if (schema.anyOf.length === 0) {
      throw Error('Cannot generate Union with empty set')
    } else {
      return Value.Create(schema.anyOf[0])
    }
  }

  /** Creates a UInt8Array value */
  export function Uint8Array(schema: Types.TUint8Array): unknown {
    if (schema.default !== undefined) {
      return schema.default
    } else if (schema.minByteLength) {
      return new globalThis.Uint8Array(schema.minByteLength)
    } else {
      return new globalThis.Uint8Array(0)
    }
  }
  /** Creates an unknown value */
  export function Unknown(schema: Types.TUnknown): unknown {
    if (schema.default !== undefined) {
      return schema.default
    } else {
      return {}
    }
  }

  /** Creates a void value */
  export function Void(schema: Types.TVoid): null {
    return null
  }

  /** Creates a default object for the given schema */
  export function Create<T extends Types.TSchema>(schema: T): Types.Static<T> {
    switch (schema.kind) {
      case 'Any':
        return Value.Any(schema as any) as any
      case 'Array':
        return Value.Array(schema as any) as any
      case 'Boolean':
        return Value.Boolean(schema as any) as any
      case 'Constructor':
        return Value.Constructor(schema as any) as any
      case 'Enum':
        return Value.Enum(schema as any) as any
      case 'Function':
        return Value.Function(schema as any) as any
      case 'Integer':
        return Value.Integer(schema as any) as any
      case 'Intersect':
        return Value.Intersect(schema as any) as any
      case 'KeyOf':
        return Value.KeyOf(schema as any) as any
      case 'Literal':
        return Value.Literal(schema as any) as any
      case 'Namespace':
        return Value.Namespace(schema as any) as any
      case 'Null':
        return Value.Null(schema as any) as any
      case 'Number':
        return Value.Number(schema as any) as any
      case 'Object':
        return Value.Object(schema as any) as any
      case 'Promise':
        return Value.Promise(schema as any) as any
      case 'Record':
        return Value.Record(schema as any) as any
      case 'Rec':
        return Value.Rec(schema as any) as any
      case 'Ref':
        return Value.Ref(schema as any) as any
      case 'RegEx':
        return Value.RegEx(schema as any) as any
      case 'String':
        return Value.String(schema as any) as any
      case 'Tuple':
        return Value.Tuple(schema as any) as any
      case 'Undefined':
        return Value.Undefined(schema as any) as any
      case 'Union':
        return Value.Union(schema as any) as any
      case 'Uint8Array':
        return Value.Uint8Array(schema as any) as any
      case 'Unknown':
        return Value.Unknown(schema as any) as any
      case 'Void':
        return Value.Void(schema as any) as any
      default:
        throw Error(`Unknown schema kind '${schema.kind}'`)
    }
  }
}
