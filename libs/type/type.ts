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

// --------------------------------------------------------------------------
// Symbols
// --------------------------------------------------------------------------

export const Kind = Symbol.for('Kind')
export const Modifier = Symbol.for('Modifier')

// --------------------------------------------------------------------------
// Modifiers
// --------------------------------------------------------------------------

export type TModifier = TReadonlyOptional<TSchema> | TOptional<TSchema> | TReadonly<TSchema>

export type TReadonly<T extends TSchema> = T & { [Modifier]: 'Readonly' }

export type TOptional<T extends TSchema> = T & { [Modifier]: 'Optional' }

export type TReadonlyOptional<T extends TSchema> = T & { [Modifier]: 'ReadonlyOptional' }

// --------------------------------------------------------------------------
// Schema
// --------------------------------------------------------------------------

export type TAnySchema =
  | TSchema
  | TAny
  | TArray
  | TBoolean
  | TConstructor
  | TEnum
  | TFunction
  | TInteger
  | TLiteral
  | TNull
  | TNumber
  | TObject
  | TPromise
  | TRecord
  | TSelf
  | TRef
  | TString
  | TTuple
  | TUndefined
  | TUnion
  | TUint8Array
  | TUnknown
  | TVoid

export interface SchemaOptions {
  $schema?: string
  $id?: string
  title?: string
  description?: string
  default?: any
  examples?: any
  design?: any
  [prop: string]: any
}

export interface TSchema extends SchemaOptions {
  [Kind]: string
  [Modifier]?: string
  params: unknown[]
  static: unknown
}



// --------------------------------------------------------------------------
// Any
// --------------------------------------------------------------------------

export interface TAny extends TSchema {
  [Kind]: 'Any'
  static: any
}

// --------------------------------------------------------------------------
// Array
// --------------------------------------------------------------------------

export interface ArrayOptions extends SchemaOptions {
  uniqueItems?: boolean
  minItems?: number
  maxItems?: number
}

export interface TArray<T extends TSchema = TSchema> extends TSchema, ArrayOptions {
  [Kind]: 'Array'
  static: Array<Static<T, this['params']>>
  type: 'array'
  items: T
}

// --------------------------------------------------------------------------
// Boolean
// --------------------------------------------------------------------------

export interface TBoolean extends TSchema {
  [Kind]: 'Boolean'
  static: boolean
  type: 'boolean'
}

// --------------------------------------------------------------------------
// Constructor
// --------------------------------------------------------------------------

type TContructorParameters<T extends readonly TSchema[], P extends unknown[]> = [...{ [K in keyof T]: T[K] extends TSchema ? Static<T[K], P> : never }]

export interface TConstructor<T extends TSchema[] = TSchema[], U extends TObject = TObject> extends TSchema {
  [Kind]: 'Constructor'
  static: new (...param: TContructorParameters<T, this['params']>) => Static<U, this['params']>
  type: 'constructor'
  parameters: T
  returns: U
}

// --------------------------------------------------------------------------
// Enum
// --------------------------------------------------------------------------

export interface TEnumOption<T> {
  type: 'number' | 'string'
  const: T
}

export interface TEnum<T extends Record<string, string | number> = Record<string, string | number>> extends TSchema {
  [Kind]: 'Enum'
  static: T[keyof T]
  anyOf: TEnumOption<T>[]
}


// --------------------------------------------------------------------------
// Exclude
// --------------------------------------------------------------------------

export interface TExclude<UnionType extends TUnion, ExcludedMembers extends TUnion> extends TUnion {
  [Kind]: 'Union',
  static: Exclude<Static<UnionType, this['params']>, Static<ExcludedMembers, this['params']>>
}

// --------------------------------------------------------------------------
// Extract
// --------------------------------------------------------------------------

export interface TExtract<Type extends TSchema, Union extends TUnion> extends TUnion {
  [Kind]: 'Union',
  static: Extract<Static<Type, this['params']>, Static<Union, this['params']>>
}

// --------------------------------------------------------------------------
// Extends
// --------------------------------------------------------------------------

export type TExtends<A extends TSchema, B extends TSchema, C extends TSchema, D extends TSchema> = Static<A> extends Static<B> ? C : D


// --------------------------------------------------------------------------
// Function
// --------------------------------------------------------------------------

export type TFunctionParameters<T extends readonly TSchema[], P extends unknown[]> = [...{ [K in keyof T]: T[K] extends TSchema ? Static<T[K], P> : never }]

export interface TFunction<T extends readonly TSchema[] = TSchema[], U extends TSchema = TSchema> extends TSchema {
  [Kind]: 'Function'
  static: (...param: TFunctionParameters<T, this['params']>) => Static<U, this['params']>
  type: 'function'
  parameters: T
  returns: U
}

// --------------------------------------------------------------------------
// Integer
// --------------------------------------------------------------------------

export interface IntegerOptions extends SchemaOptions {
  exclusiveMaximum?: number
  exclusiveMinimum?: number
  maximum?: number
  minimum?: number
  multipleOf?: number
}

export interface TInteger extends TSchema, IntegerOptions {
  [Kind]: 'Integer'
  static: number
  type: 'integer'
}

// --------------------------------------------------------------------------
// Intersect
// --------------------------------------------------------------------------

export type IntersectEvaluate<T extends readonly TSchema[], P extends unknown[]> = { [K in keyof T]: T[K] extends TSchema ? Static<T[K], P> : never }

export type IntersectReduce<I extends unknown, T extends readonly any[]> = T extends [infer A, ...infer B] ? IntersectReduce<I & A, B> : I extends object ? I : {}

export interface TIntersect<T extends TObject[] = TObject[]> extends TObject {
  static: IntersectReduce<unknown, IntersectEvaluate<T, this['params']>>
  properties: Record<keyof IntersectReduce<unknown, IntersectEvaluate<T, this['params']>>, TSchema>
}

// --------------------------------------------------------------------------
// KeyOf: Implemented by way of Union<TLiteral<string>>
// --------------------------------------------------------------------------

type UnionToIntersect<U> = (U extends unknown ? (arg: U) => 0 : never) extends (arg: infer I) => 0 ? I : never
type UnionLast<U> = UnionToIntersect<U extends unknown ? (x: U) => 0 : never> extends (x: infer L) => 0 ? L : never
type UnionToTuple<U, L = UnionLast<U>> = [U] extends [never] ? [] : [...UnionToTuple<Exclude<U, L>>, L]

export type TKeyOf<T extends TObject> = { [K in ObjectPropertyKeys<T>]: TLiteral<K> } extends infer R ? UnionToTuple<R[keyof R]> : never

// --------------------------------------------------------------------------
// Literal
// --------------------------------------------------------------------------

export type TLiteralValue = string | number | boolean

export interface TLiteral<T extends TLiteralValue = TLiteralValue> extends TSchema {
  [Kind]: 'Literal'
  static: T
  const: T
}

// --------------------------------------------------------------------------
// Null
// --------------------------------------------------------------------------

export interface TNull extends TSchema {
  [Kind]: 'Null'
  static: null
  type: 'null'
}

// --------------------------------------------------------------------------
// Number
// --------------------------------------------------------------------------

export interface NumberOptions extends SchemaOptions {
  exclusiveMaximum?: number
  exclusiveMinimum?: number
  maximum?: number
  minimum?: number
  multipleOf?: number
}

export interface TNumber extends TSchema, NumberOptions {
  [Kind]: 'Number'
  static: number
  type: 'number'
}

// --------------------------------------------------------------------------
// Object
// --------------------------------------------------------------------------

export type ReadonlyOptionalPropertyKeys<T extends TProperties> = { [K in keyof T]: T[K] extends TReadonlyOptional<TSchema> ? K : never }[keyof T]
export type ReadonlyPropertyKeys<T extends TProperties> = { [K in keyof T]: T[K] extends TReadonly<TSchema> ? K : never }[keyof T]
export type OptionalPropertyKeys<T extends TProperties> = { [K in keyof T]: T[K] extends TOptional<TSchema> ? K : never }[keyof T]
export type RequiredPropertyKeys<T extends TProperties> = keyof Omit<T, ReadonlyOptionalPropertyKeys<T> | ReadonlyPropertyKeys<T> | OptionalPropertyKeys<T>>

export type PropertiesReduce<T extends TProperties, P extends unknown[]> = { readonly [K in ReadonlyOptionalPropertyKeys<T>]?: Static<T[K], P> } & { readonly [K in ReadonlyPropertyKeys<T>]: Static<T[K], P> } & {
  [K in OptionalPropertyKeys<T>]?: Static<T[K], P>
} & { [K in RequiredPropertyKeys<T>]: Static<T[K], P> } extends infer R
  ? { [K in keyof R]: R[K] }
  : never

export interface TProperties {
  [key: string]: TSchema
}

export type ObjectProperties<T> = T extends TObject<infer U> ? U : never
export type ObjectPropertyKeys<T> = T extends TObject<infer U> ? keyof U : never

export interface ObjectOptions extends SchemaOptions {
  additionalProperties?: boolean
  minProperties?: number
  maxProperties?: number
}

export interface TObject<T extends TProperties = TProperties> extends TSchema {
  [Kind]: 'Object'
  static: PropertiesReduce<T, this['params']>
  type: 'object'
  properties: T
  required?: string[]
}

// --------------------------------------------------------------------------
// Omit
// --------------------------------------------------------------------------

interface TOmit<T extends TObject, Properties extends ObjectPropertyKeys<T>[]> extends TObject, ObjectOptions {
  static: Omit<Static<T, this['params']>, Properties[number]>
  properties: T extends TObject ? Omit<T['properties'], Properties[number]> : never
}

// --------------------------------------------------------------------------
// Partial
// --------------------------------------------------------------------------

export interface TPartial<T extends TObject> extends TObject {
  static: Partial<Static<T, this['params']>>
}

// --------------------------------------------------------------------------
// Pick
// --------------------------------------------------------------------------

export interface TPick<T extends TObject, Properties extends ObjectPropertyKeys<T>[]> extends TObject, ObjectOptions {
  static: Pick<Static<T, this['params']>, Properties[number]>
  properties: ObjectProperties<T>
}

// --------------------------------------------------------------------------
// Promise
// --------------------------------------------------------------------------

export interface TPromise<T extends TSchema = TSchema> extends TSchema {
  [Kind]: 'Promise'
  static: Promise<Static<T, this['params']>>
  type: 'promise'
  item: TSchema
}

// --------------------------------------------------------------------------
// Record
// --------------------------------------------------------------------------

export type TRecordKey = TString | TNumber | TUnion<TLiteral<any>[]>

export interface TRecord<K extends TRecordKey = TRecordKey, T extends TSchema = TSchema> extends TSchema {
  [Kind]: 'Record'
  static: Record<Static<K>, Static<T, this['params']>>
  type: 'object'
  patternProperties: { [pattern: string]: T }
}

// --------------------------------------------------------------------------
// Rec
// --------------------------------------------------------------------------

export interface TSelf extends TSchema {
  [Kind]: 'Self'
  static: this['params'][0]
  $ref: string
}

export type TRecReduce<T extends TSchema> = Static<T, [TRecReduce<T>]>

export interface TRec<T extends TSchema> extends TSchema {
  static: TRecReduce<T>
}

// --------------------------------------------------------------------------
// Ref
// --------------------------------------------------------------------------

export interface TRef<T extends TSchema = TSchema> extends TSchema {
  [Kind]: 'Ref'
  static: Static<T, this['params']>
  $ref: string
}

// --------------------------------------------------------------------------
// Required
// --------------------------------------------------------------------------

export interface TRequired<T extends TObject | TRef<TObject>> extends TObject {
  static: Required<Static<T, this['params']>>
}

// --------------------------------------------------------------------------
// String
// --------------------------------------------------------------------------

export type StringFormatOption =
  | 'date-time'
  | 'time'
  | 'date'
  | 'email'
  | 'idn-email'
  | 'hostname'
  | 'idn-hostname'
  | 'ipv4'
  | 'ipv6'
  | 'uri'
  | 'uri-reference'
  | 'iri'
  | 'uuid'
  | 'iri-reference'
  | 'uri-template'
  | 'json-pointer'
  | 'relative-json-pointer'
  | 'regex'

export interface StringOptions<TFormat extends string> extends SchemaOptions {
  minLength?: number
  maxLength?: number
  pattern?: string
  format?: TFormat
  contentEncoding?: '7bit' | '8bit' | 'binary' | 'quoted-printable' | 'base64'
  contentMediaType?: string
}

export interface TString extends TSchema, StringOptions<string> {
  [Kind]: 'String'
  static: string
  type: 'string'
}

// --------------------------------------------------------------------------
// Tuple
// --------------------------------------------------------------------------

export interface TTuple<T extends TSchema[] = TSchema[]> extends TSchema {
  [Kind]: 'Tuple'
  static: { [K in keyof T]: T[K] extends TSchema ? Static<T[K], this['params']> : T[K] }
  type: 'array'
  items?: T
  additionalItems?: false
  minItems: number
  maxItems: number
}

// --------------------------------------------------------------------------
// Undefined
// --------------------------------------------------------------------------

export interface TUndefined extends TSchema {
  [Kind]: 'Undefined'
  specialized: 'Undefined'
  static: undefined
  type: 'object'
}

// --------------------------------------------------------------------------
// Union
// --------------------------------------------------------------------------

export interface TUnion<T extends TSchema[] = TSchema[]> extends TSchema {
  [Kind]: 'Union'
  static: { [K in keyof T]: T[K] extends TSchema ? Static<T[K], this['params']> : never }[number]
  anyOf: T
}

// -------------------------------------------------------------------------
// Uint8Array
// -------------------------------------------------------------------------

export interface TypedArrayOptions extends SchemaOptions {
  maxByteLength?: number
  minByteLength?: number
}

export interface TUint8Array extends TSchema, TypedArrayOptions {
  [Kind]: 'Uint8Array'
  static: Uint8Array
  specialized: 'Uint8Array'
  type: 'object'
}

// --------------------------------------------------------------------------
// Unknown
// --------------------------------------------------------------------------

export interface TUnknown extends TSchema {
  [Kind]: 'Unknown'
  static: unknown
}

// --------------------------------------------------------------------------
// Unsafe
// --------------------------------------------------------------------------

export interface TUnsafe<T> extends TSchema {
  [Kind]: 'Unknown'
  static: T
}

// --------------------------------------------------------------------------
// Void
// --------------------------------------------------------------------------

export interface TVoid extends TSchema {
  [Kind]: 'Void'
  static: void
  type: 'null'
}

// --------------------------------------------------------------------------
// Static<T>
// --------------------------------------------------------------------------

export type Static<T extends TSchema, P extends unknown[] = []> = (T & { params: P })['static']


// --------------------------------------------------------------------------
// Extends Ruleset
// --------------------------------------------------------------------------

export namespace Extends {
  const referenceMap = new Map<string, TAnySchema>()
  let recursionDepth = 0

  function Any<Left extends TAnySchema, Right extends TAnySchema>(left: Left, right: Right) {
    return true
  }

  function Array<Left extends TAnySchema, Right extends TAnySchema>(left: Left, right: Right) {
    if (right[Kind] !== 'Array') return false
    if (left.items === undefined && right.items !== undefined) return false
    if (left.items !== undefined && right.items === undefined) return false
    if (left.items === undefined && right.items === undefined) return true
    return Extends(left.items, right.items)
  }

  function Constructor<Left extends TAnySchema, Right extends TAnySchema>(left: Left, right: Right) {
    if (right[Kind] !== 'Constructor') return false
    if (left.parameters.length !== right.parameters.length) return false
    if (!Extends(left.returns, right.returns)) return false
    for (let i = 0; i < left.parameters.length; i++) {
      if (!Extends(left.parameters[i], right.parameters[i])) return false
    }
    return true
  }

  function Enum<Left extends TAnySchema, Right extends TAnySchema>(left: Left, right: Right) {
    if (right[Kind] !== 'Enum') return false
    if (left.anyOf.length !== right.anyOf.length) return false
    for (let i = 0; i < left.anyOf.length; i++) {
      const innerLeft = left.anyOf[i]
      const innerRight = right.anyOf[i]
      if (innerLeft.type !== innerRight.type || innerLeft.const !== innerRight.const) return false
    }
    return true
  }

  function Function<Left extends TAnySchema, Right extends TAnySchema>(left: Left, right: Right) {
    if (right[Kind] !== 'Function') return false
    if (left.parameters.length !== right.parameters.length) return false
    if (!Extends(left.returns, right.returns)) return false
    for (let i = 0; i < left.parameters.length; i++) {
      if (!Extends(left.parameters[i], right.parameters[i])) return false
    }
    return true
  }

  function Integer<Left extends TAnySchema, Right extends TAnySchema>(left: Left, right: Right) {
    if (
      right[Kind] === 'Any' ||
      right[Kind] === 'Unknown' ||
      right[Kind] === 'Integer'
    ) {
      return true
    } else if (right[Kind] === 'Union') {
      for (const inner of right.anyOf) {
        if (Extends(left, inner)) return true
      }
    }
    return false
  }

  function Literal<Left extends TAnySchema, Right extends TAnySchema>(left: Left, right: Right) {
    if (right[Kind] === 'Literal') {
      return right.const === left.const
    } else if (
      right[Kind] === 'Any' ||
      right[Kind] === 'Unknown'
    ) {
      return true
    } else if (right[Kind] === 'String') {
      return typeof left.const === 'string'
    } else if (right[Kind] === 'Number') {
      return typeof left.const === 'number'
    } else if (right[Kind] === 'Boolean') {
      return typeof left.const === 'boolean'
    } else if (right[Kind] === 'Union') {
      for (const inner of right.anyOf) {
        if (Extends(left, inner)) return true
      }
    }
    return false
  }

  function Number<Left extends TAnySchema, Right extends TAnySchema>(left: Left, right: Right) {
    if (
      right[Kind] === 'Any' ||
      right[Kind] === 'Unknown' ||
      right[Kind] === 'Number'
    ) {
      return true
    } else if (right[Kind] === 'Union') {
      for (const inner of right.anyOf) {
        if (Extends(left, inner)) return true
      }
    }
    return false
  }

  function Null<Left extends TAnySchema, Right extends TAnySchema>(left: Left, right: Right) {
    if (
      right[Kind] === 'Any' ||
      right[Kind] === 'Unknown' ||
      right[Kind] === 'Null'
    ) {
      return true
    } else if (right[Kind] === 'Union') {
      for (const inner of right.anyOf) {
        if (Extends(left, inner)) return true
      }
    }
    return false
  }

  function Object<Left extends TAnySchema, Right extends TAnySchema>(left: Left, right: Right) {
    if (right[Kind] !== 'Object') return false
    const leftPropertyKeys = globalThis.Object.keys(left.properties)
    const rightPropertyKeys = globalThis.Object.keys(right.properties)
    if (rightPropertyKeys.length > leftPropertyKeys.length) return false
    if (!rightPropertyKeys.every(rightPropertyKey => leftPropertyKeys.includes(rightPropertyKey))) return false
    for (const rightPropertyKey of rightPropertyKeys) {
      const innerLeft = left.properties[rightPropertyKey]
      const innerRight = right.properties[rightPropertyKey]
      if (!Extends(innerLeft, innerRight)) return false

    }
    return true
  }

  function Unknown<Left extends TAnySchema, Right extends TAnySchema>(left: Left, right: Right) {
    return right[Kind] === 'Unknown' || right[Kind] === 'Any'
  }

  function Undefined<Left extends TAnySchema, Right extends TAnySchema>(left: Left, right: Right) {
    if (
      right[Kind] === 'Any' ||
      right[Kind] === 'Unknown' ||
      right[Kind] === 'Undefined'
    ) {
      return true
    } else if (right[Kind] === 'Union') {
      for (const inner of right.anyOf) {
        if (Extends(left, inner)) return true
      }
    }
    return false
  }

  function Boolean<Left extends TAnySchema, Right extends TAnySchema>(left: Left, right: Right) {
    if (
      right[Kind] === 'Any' ||
      right[Kind] === 'Unknown' ||
      right[Kind] === 'Boolean'
    ) {
      return true
    } else if (right[Kind] === 'Union') {
      for (const inner of right.anyOf) {
        if (Extends(left, inner)) return true
      }
    }
    return false
  }

  function Record<Left extends TAnySchema, Right extends TAnySchema>(left: Left, right: Right) {
    return false
  }

  function Ref<Left extends TAnySchema, Right extends TAnySchema>(left: Left, right: Right) {
    if (!referenceMap.has(left.$ref)) throw Error(`Cannot locate referenced $id '${left.$ref}'`)
    const resolved = referenceMap.get(left.$ref)!
    return Extends(resolved, right)
  }

  function Self<Left extends TAnySchema, Right extends TAnySchema>(left: Left, right: Right) {
    if (!referenceMap.has(left.$ref)) throw Error(`Cannot locate referenced self $id '${left.$ref}'`)
    const resolved = referenceMap.get(left.$ref)!
    return Extends(resolved, right)
  }

  function String<Left extends TAnySchema, Right extends TAnySchema>(left: Left, right: Right) {
    if (
      right[Kind] === 'Any' ||
      right[Kind] === 'Unknown' ||
      right[Kind] === 'String'
    ) {
      return true
    } else if (right[Kind] === 'Union') {
      for (const inner of right.anyOf) {
        if (Extends(left, inner)) return true
      }
    }
    return false
  }

  function Tuple<Left extends TAnySchema, Right extends TAnySchema>(left: Left, right: Right) {
    if (right[Kind] !== 'Tuple') return false
    if (left.items === undefined && right.items === undefined) return true
    if (left.items === undefined && right.items !== undefined) return false
    if (left.items !== undefined && right.items === undefined) return false
    if (left.items === undefined && right.items === undefined) return true
    if (left.minItems !== right.minItems || left.maxItems !== right.maxItems) return false
    for (let i = 0; i < left.items!.length; i++) {
      if (!Extends(left.items![i], right.items![i])) return false
    }
    return true
  }

  function Uint8Array<Left extends TAnySchema, Right extends TAnySchema>(left: Left, right: Right) {
    return right[Kind] === 'Uint8Array'
  }

  function Union<Left extends TAnySchema, Right extends TAnySchema>(left: Left, right: Right) {
    if (right[Kind] === 'Union') {
      for (const innerLeft of left.anyOf) {
        for (const innerRight of right.anyOf) {
          if (!Extends(innerLeft, innerRight)) return false
        }
      }
    } else {
      for (const innerLeft of left.anyOf) {
        if (!Extends(innerLeft, right)) return false
      }
    }
    return true
  }

  function Extends<Left extends TAnySchema, Right extends TAnySchema>(left: Left, right: Right): boolean {
    recursionDepth += 1; if (recursionDepth > 1000) return true

    if (left.$id !== undefined) referenceMap.set(left.$id!, left)
    if (right.$id !== undefined) referenceMap.set(right.$id!, right)
    const resolvedRight = right[Kind] === 'Self' ? referenceMap.get(right.$ref)! : right

    switch (left[Kind]) {
      case 'Any': return Any(left, resolvedRight)
      case 'Array': return Array(left, resolvedRight)
      case 'Boolean': return Boolean(left, resolvedRight)
      case 'Constructor': return Constructor(left, resolvedRight)
      case 'Enum': return Enum(left, resolvedRight)
      case 'Function': return Function(left, resolvedRight)
      case 'Integer': return Integer(left, resolvedRight)
      case 'Literal': return Literal(left, resolvedRight)
      case 'Null': return Null(left, resolvedRight)
      case 'Number': return Number(left, resolvedRight)
      case 'Object': return Object(left, resolvedRight)
      case 'Record': return Record(left, resolvedRight)
      case 'Ref': return Ref(left, resolvedRight)
      case 'String': return String(left, resolvedRight)
      case 'Tuple': return Tuple(left, resolvedRight)
      case 'Undefined': return Undefined(left, resolvedRight)
      case 'Uint8Array': return Uint8Array(left, resolvedRight)
      case 'Union': return Union(left, resolvedRight)
      case 'Unknown': return Unknown(left, resolvedRight)
      case 'Self': return Self(left, resolvedRight)
      default: return false
    }
  }

  /** Returns true if the left schema structurally extends the right schema. */
  export function Check<Left extends TAnySchema, Right extends TAnySchema>(left: Left, right: Right): boolean {
    referenceMap.clear()
    recursionDepth = 0
    return Extends(left, right)
  }
}

// --------------------------------------------------------------------------
// TypeBuilder
// --------------------------------------------------------------------------

let TypeOrdinal = 0

export class TypeBuilder {

  // ----------------------------------------------------------------------
  // Modifiers
  // ----------------------------------------------------------------------

  /** Creates a readonly optional property */
  public ReadonlyOptional<T extends TSchema>(item: T): TReadonlyOptional<T> {
    return { [Modifier]: 'ReadonlyOptional', ...item }
  }

  /** Creates a readonly property */
  public Readonly<T extends TSchema>(item: T): TReadonly<T> {
    return { [Modifier]: 'Readonly', ...item }
  }

  /** Creates a optional property */
  public Optional<T extends TSchema>(item: T): TOptional<T> {
    return { [Modifier]: 'Optional', ...item }
  }

  // ----------------------------------------------------------------------
  // Types
  // ----------------------------------------------------------------------

  /** Creates a any type */
  public Any(options: SchemaOptions = {}): TAny {
    return this.Create({ ...options, [Kind]: 'Any' })
  }

  /** Creates a array type */
  public Array<T extends TSchema>(items: T, options: ArrayOptions = {}): TArray<T> {
    return this.Create({ ...options, [Kind]: 'Array', type: 'array', items })
  }

  /** Creates a boolean type */
  public Boolean(options: SchemaOptions = {}): TBoolean {
    return this.Create({ ...options, [Kind]: 'Boolean', type: 'boolean' })
  }

  /** Creates a constructor type */
  public Constructor<T extends TSchema[], U extends TObject>(parameters: [...T], returns: U, options: SchemaOptions = {}): TConstructor<T, U> {
    return this.Create({ ...options, [Kind]: 'Constructor', type: 'constructor', parameters, returns })
  }

  /** Creates a enum type */
  public Enum<T extends Record<string, string | number>>(item: T, options: SchemaOptions = {}): TEnum<T> {
    const values = Object.keys(item)
      .filter((key) => isNaN(key as any))
      .map((key) => item[key]) as T[keyof T][]
    const anyOf = values.map((value) => (typeof value === 'string' ? { type: 'string' as const, const: value } : { type: 'number' as const, const: value }))
    return this.Create({ ...options, [Kind]: 'Enum', anyOf })
  }

  /** Constructs a type by excluding from UnionType all union members that are assignable to ExcludedMembers */
  public Exclude<UnionType extends TUnion, ExcludedMembers extends TUnion>(unionType: UnionType, excludedMembers: ExcludedMembers, options: SchemaOptions = {}): TExclude<UnionType, ExcludedMembers> {
    const anyOf = unionType.anyOf.filter((schema: TSchema) => !Extends.Check(schema, excludedMembers)).map(schema => this.Clone(schema))
    return this.Create({ ...options, [Kind]: 'Union', anyOf })
  }

  /** Constructs a type by extracting from Type all union members that are assignable to Union. */
  public Extract<Type extends TSchema, Union extends TUnion>(type: Type, union: Union, options: SchemaOptions = {}): TExtract<Type, Union> {
    if (type[Kind] === 'Union') {
      const anyOf = type.anyOf.filter((schema: TSchema) => Extends.Check(schema, union)).map((schema: TSchema) => this.Clone(schema))
      return this.Create({ ...options, [Kind]: 'Union', anyOf })
    } else {
      const anyOf = union.anyOf.filter(schema => Extends.Check(type, schema)).map(schema => this.Clone(schema))
      return this.Create({ ...options, [Kind]: 'Union', anyOf })
    }
  }

  /** Creates a conditionally mapped schema by returning schema C if schema A extends B */
  public Extends<A extends TSchema, B extends TSchema, C extends TSchema, D extends TSchema>(a: A, b: B, c: C, d: D): TExtends<A, B, C, D> {
    return Extends.Check(a, b) ? this.Clone(c) : this.Clone(d)
  }

  /** Creates a function type */
  public Function<T extends readonly TSchema[], U extends TSchema>(parameters: [...T], returns: U, options: SchemaOptions = {}): TFunction<T, U> {
    return this.Create({ ...options, [Kind]: 'Function', type: 'function', parameters, returns })
  }

  /** Creates a integer type */
  public Integer(options: IntegerOptions = {}): TInteger {
    return this.Create({ ...options, [Kind]: 'Integer', type: 'integer' })
  }

  /** Creates a intersect type. */
  public Intersect<T extends TObject[]>(objects: [...T], options: ObjectOptions = {}): TIntersect<T> {
    const isOptional = (schema: TSchema) => (schema[Modifier] && schema[Modifier] === 'Optional') || schema[Modifier] === 'ReadonlyOptional'
    const [required, optional] = [new Set<string>(), new Set<string>()]
    for (const object of objects) {
      for (const [key, schema] of Object.entries(object.properties)) {
        if (isOptional(schema)) optional.add(key)
      }
    }
    for (const object of objects) {
      for (const key of Object.keys(object.properties)) {
        if (!optional.has(key)) required.add(key)
      }
    }
    const properties = {} as Record<string, any>
    for (const object of objects) {
      for (const [key, schema] of Object.entries(object.properties)) {
        delete schema[Modifier]
        properties[key] = properties[key] === undefined ? schema : { [Kind]: 'Union', anyOf: [properties[key], { ...schema }] }
      }
    }
    return this.Create({ ...options, [Kind]: 'Object', type: 'object', properties, required: [...required] })
  }

  /** Creates a keyof type */
  public KeyOf<T extends TObject>(object: T, options: SchemaOptions = {}): TUnion<TKeyOf<T>> {
    const items = Object.keys(object.properties).map((key) => this.Create({ ...options, [Kind]: 'Literal', type: 'string', const: key }))
    return this.Create({ ...options, [Kind]: 'Union', anyOf: items })
  }

  /** Creates a literal type. */
  public Literal<T extends TLiteralValue>(value: T, options: SchemaOptions = {}): TLiteral<T> {
    return this.Create({ ...options, [Kind]: 'Literal', const: value, type: typeof value as 'string' | 'number' | 'boolean' })
  }

  /** Creates a null type */
  public Null(options: SchemaOptions = {}): TNull {
    return this.Create({ ...options, [Kind]: 'Null', type: 'null' })
  }

  /** Creates a number type */
  public Number(options: NumberOptions = {}): TNumber {
    return this.Create({ ...options, [Kind]: 'Number', type: 'number' })
  }

  /** Creates an object type with the given properties */
  public Object<T extends TProperties>(properties: T, options: ObjectOptions = {}): TObject<T> {
    const property_names = Object.keys(properties)
    const optional = property_names.filter((name) => {
      const property = properties[name] as TModifier
      const modifier = property[Modifier]
      return modifier && (modifier === 'Optional' || modifier === 'ReadonlyOptional')
    })
    const required_names = property_names.filter((name) => !optional.includes(name))
    const required = required_names.length > 0 ? required_names : undefined
    return this.Create(required ? { ...options, [Kind]: 'Object', type: 'object', properties, required } : { ...options, [Kind]: 'Object', type: 'object', properties })
  }

  /** Creates a new object whose properties are omitted from the given object */
  public Omit<T extends TObject, Properties extends Array<ObjectPropertyKeys<T>>>(schema: T, keys: [...Properties], options: ObjectOptions = {}): TOmit<T, Properties> {
    const next = { ...this.Clone(schema), ...options }
    next.required = next.required ? next.required.filter((key: string) => !keys.includes(key as any)) : undefined
    for (const key of Object.keys(next.properties)) {
      if (keys.includes(key as any)) delete next.properties[key]
    }
    return this.Create(next)
  }

  /** Creates an object type whose properties are all optional */
  public Partial<T extends TObject>(schema: T, options: ObjectOptions = {}): TPartial<T> {
    const next = { ...(this.Clone(schema) as T), ...options }
    delete next.required
    for (const key of Object.keys(next.properties)) {
      const property = next.properties[key]
      const modifer = property[Modifier]
      switch (modifer) {
        case 'ReadonlyOptional':
          property[Modifier] = 'ReadonlyOptional'
          break
        case 'Readonly':
          property[Modifier] = 'ReadonlyOptional'
          break
        case 'Optional':
          property[Modifier] = 'Optional'
          break
        default:
          property[Modifier] = 'Optional'
          break
      }
    }
    return this.Create(next)
  }

  /** Creates a new object whose properties are picked from the given object */
  public Pick<T extends TObject, Properties extends Array<ObjectPropertyKeys<T>>>(schema: T, keys: [...Properties], options: ObjectOptions = {}): TPick<T, Properties> {
    const next = { ...this.Clone(schema), ...options }
    next.required = next.required ? next.required.filter((key: any) => keys.includes(key)) : undefined
    for (const key of Object.keys(next.properties)) {
      if (!keys.includes(key as any)) delete next.properties[key]
    }
    return this.Create(next)
  }

  /** Creates a promise type. This type cannot be represented in schema. */
  public Promise<T extends TSchema>(item: T, options: SchemaOptions = {}): TPromise<T> {
    return this.Create({ ...options, [Kind]: 'Promise', type: 'promise', item })
  }

  /** Creates a record type */
  public Record<K extends TRecordKey, T extends TSchema>(key: K, value: T, options: ObjectOptions = {}): TRecord<K, T> {
    const pattern = (() => {
      switch (key[Kind]) {
        case 'Union':
          return `^${key.anyOf.map((literal: any) => literal.const as TLiteralValue).join('|')}$`
        case 'Number':
          return '^(0|[1-9][0-9]*)$'
        case 'String':
          return key.pattern ? key.pattern : '^.*$'
        default:
          throw Error('Invalid Record Key')
      }
    })()
    return this.Create({ ...options, [Kind]: 'Record', type: 'object', patternProperties: { [pattern]: value } })
  }

  /** Creates a recursive object type */
  public Rec<T extends TSchema>(callback: (self: TSelf) => T, options: SchemaOptions = {}): TRec<T> {
    if (options.$id === undefined) options.$id = `type-${TypeOrdinal++}`
    const self = callback({ [Kind]: 'Self', $ref: `${options.$id}` } as any)
    self.$id = options.$id
    return this.Create({ ...options, ...self } as any)
  }

  /** Creates a reference schema */
  public Ref<T extends TSchema>(schema: T, options: SchemaOptions = {}): TRef<T> {
    if (schema.$id === undefined) throw Error('Cannot reference schema as it has no Id')
    return this.Create({ ...options, [Kind]: 'Ref', $ref: schema.$id! })
  }

  /** Creates a string type from a regular expression */
  public RegEx(regex: RegExp, options: SchemaOptions = {}): TString {
    return this.Create({ ...options, [Kind]: 'String', type: 'string', pattern: regex.source })
  }

  /** Creates an object type whose properties are all required */
  public Required<T extends TObject>(schema: T, options: SchemaOptions = {}): TRequired<T> {
    const next = { ...(this.Clone(schema) as T), ...options }
    next.required = Object.keys(next.properties)
    for (const key of Object.keys(next.properties)) {
      const property = next.properties[key]
      const modifier = property[Modifier]
      switch (modifier) {
        case 'ReadonlyOptional':
          property[Modifier] = 'Readonly'
          break
        case 'Readonly':
          property[Modifier] = 'Readonly'
          break
        case 'Optional':
          delete property[Modifier]
          break
        default:
          delete property[Modifier]
          break
      }
    }
    return this.Create(next)
  }

  /** Removes Kind and Modifier symbols from this schema */
  public Strict<T extends TSchema>(schema: TSchema): T {
    return JSON.parse(JSON.stringify(schema))
  }

  /** Creates a string type */
  public String<TCustomFormatOption extends string>(options: StringOptions<StringFormatOption | TCustomFormatOption> = {}): TString {
    return this.Create({ ...options, [Kind]: 'String', type: 'string' })
  }

  /** Creates a tuple type */
  public Tuple<T extends TSchema[]>(items: [...T], options: SchemaOptions = {}): TTuple<T> {
    const additionalItems = false
    const minItems = items.length
    const maxItems = items.length
    const schema = (items.length > 0 ? { ...options, [Kind]: 'Tuple', type: 'array', items, additionalItems, minItems, maxItems } : { ...options, [Kind]: 'Tuple', type: 'array', minItems, maxItems }) as any
    return this.Create(schema)
  }

  /** Creates a undefined type */
  public Undefined(options: SchemaOptions = {}): TUndefined {
    return this.Create({ ...options, [Kind]: 'Undefined', type: 'object', specialized: 'Undefined' })
  }

  /** Creates a union type */
  public Union<T extends TSchema[]>(items: [...T], options: SchemaOptions = {}): TUnion<T> {
    return this.Create({ ...options, [Kind]: 'Union', anyOf: items })
  }

  /** Creates a Uint8Array type */
  public Uint8Array(options: TypedArrayOptions = {}): TUint8Array {
    return this.Create({ ...options, [Kind]: 'Uint8Array', type: 'object', specialized: 'Uint8Array' })
  }

  /** Creates an unknown type */
  public Unknown(options: SchemaOptions = {}): TUnknown {
    return this.Create({ ...options, [Kind]: 'Unknown' })
  }

  /** Creates a user defined schema that infers as type T  */
  public Unsafe<T>(options: SchemaOptions = {}): TUnsafe<T> {
    return this.Create({ ...options, [Kind]: 'Unknown' })
  }

  /** Creates a void type */
  public Void(options: SchemaOptions = {}): TVoid {
    return this.Create({ ...options, [Kind]: 'Void', type: 'null' })
  }

  /** Use this function to return TSchema with static and params omitted */
  protected Create<T>(schema: Omit<T, 'static' | 'params'>): T {
    return schema as any
  }

  /** Clones the given value */
  protected Clone(value: any): any {
    const isObject = (object: any): object is Record<string | symbol, any> => typeof object === 'object' && object !== null && !Array.isArray(object)
    const isArray = (object: any): object is any[] => typeof object === 'object' && object !== null && Array.isArray(object)
    if (isObject(value)) {
      return Object.keys(value).reduce(
        (acc, key) => ({
          ...acc,
          [key]: this.Clone(value[key]),
        }),
        Object.getOwnPropertySymbols(value).reduce(
          (acc, key) => ({
            ...acc,
            [key]: this.Clone(value[key]),
          }),
          {},
        ),
      )
    } else if (isArray(value)) {
      return value.map((item: any) => this.Clone(item))
    } else {
      return value
    }
  }
}

/** JSON Schema Type Builder with Static Type Resolution for TypeScript */
export const Type = new TypeBuilder()
