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
// Modifiers
// --------------------------------------------------------------------------

export type TModifier = TReadonlyOptional<TSchema> | TOptional<TSchema> | TReadonly<TSchema>

export type TReadonly<T extends TSchema> = T & { modifier: 'Readonly' }

export type TOptional<T extends TSchema> = T & { modifier: 'Optional' }

export type TReadonlyOptional<T extends TSchema> = T & { modifier: 'ReadonlyOptional' }

// --------------------------------------------------------------------------
// Schema
// --------------------------------------------------------------------------

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
  params: unknown[]
  static: unknown
  kind: string
  modifier?: string
}

// --------------------------------------------------------------------------
// Any
// --------------------------------------------------------------------------

export interface TAny extends TSchema {
  static: any
  kind: 'Any'
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
  static: Array<Static<T, this['params']>>
  kind: 'Array'
  type: 'array'
  items: T
}

// --------------------------------------------------------------------------
// Boolean
// --------------------------------------------------------------------------

export interface TBoolean extends TSchema {
  static: boolean
  kind: 'Boolean'
  type: 'boolean'
}

// --------------------------------------------------------------------------
// Constructor
// --------------------------------------------------------------------------

type TContructorParameters<T extends readonly TSchema[], P extends unknown[]> = [...{ [K in keyof T]: T[K] extends TSchema ? Static<T[K], P> : never }]

export interface TConstructor<T extends TSchema[] = TSchema[], U extends TObject = TObject> extends TSchema {
  static: new (...param: TContructorParameters<T, this['params']>) => Static<U, this['params']>
  kind: 'Constructor'
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

export interface TEnum<T extends Record<string, string | number>> extends TSchema {
  static: T[keyof T]
  kind: 'Enum'
  anyOf: TEnumOption<T>[]
}

// --------------------------------------------------------------------------
// Function
// --------------------------------------------------------------------------

export type TFunctionParameters<T extends readonly TSchema[], P extends unknown[]> = [...{ [K in keyof T]: T[K] extends TSchema ? Static<T[K], P> : never }]

export interface TFunction<T extends readonly TSchema[] = TSchema[], U extends TSchema = TSchema> extends TSchema {
  static: (...param: TFunctionParameters<T, this['params']>) => Static<U, this['params']>
  kind: 'Function'
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
  static: number
  kind: 'Integer'
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
// KeyOf
// --------------------------------------------------------------------------

export interface TKeyOf<T extends TObject> extends TSchema {
  static: ObjectPropertyKeys<T>
  kind: 'KeyOf'
  enum: ObjectPropertyKeys<T>[]
}

// --------------------------------------------------------------------------
// Literal
// --------------------------------------------------------------------------

export type TLiteralValue = string | number | boolean

export interface TLiteral<T extends TLiteralValue = TLiteralValue> extends TSchema {
  static: T
  kind: 'Literal'
  const: T
}

// --------------------------------------------------------------------------
// Null
// --------------------------------------------------------------------------

export interface TNull extends TSchema {
  static: null
  kind: 'Null'
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
  static: number
  kind: 'Number'
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
  static: PropertiesReduce<T, this['params']>
  kind: 'Object'
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

export interface TPromise<T extends TSchema> extends TSchema {
  static: Promise<Static<T, this['params']>>
  kind: 'Promise'
  type: 'promise'
  item: TSchema
}

// --------------------------------------------------------------------------
// Record
// --------------------------------------------------------------------------

export type TRecordKey = TString | TNumber | TUnion<TLiteral<string>[]>

export interface TRecord<K extends TRecordKey, T extends TSchema> extends TSchema {
  static: Record<Static<K>, Static<T, this['params']>>
  kind: 'Record'
  type: 'object'
  patternProperties: { [pattern: string]: T }
}

// --------------------------------------------------------------------------
// Rec
// --------------------------------------------------------------------------

export interface TSelf extends TSchema {
  static: this['params'][0]
  kind: 'Self'
  $ref: string
}

export type TRecReduce<T extends TSchema> = Static<T, [TRecReduce<T>]>

export interface TRec<T extends TSchema> extends TSchema {
  static: TRecReduce<T>
}

// --------------------------------------------------------------------------
// Ref
// --------------------------------------------------------------------------

export interface TRef<T extends TSchema> extends TSchema {
  static: Static<T, this['params']>
  kind: 'Ref'
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
  static: string
  kind: 'String'
  type: 'string'
}

// --------------------------------------------------------------------------
// Tuple
// --------------------------------------------------------------------------

export interface TTuple<T extends TSchema[] = TSchema[]> extends TSchema {
  static: { [K in keyof T]: T[K] extends TSchema ? Static<T[K], this['params']> : T[K] }
  kind: 'Tuple'
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
  static: undefined
  specialized: 'Undefined'
  kind: 'Undefined'
  type: 'object'
}

// --------------------------------------------------------------------------
// Union
// --------------------------------------------------------------------------

export interface TUnion<T extends TSchema[] = TSchema[]> extends TSchema {
  static: { [K in keyof T]: T[K] extends TSchema ? Static<T[K], this['params']> : never }[number]
  kind: 'Union'
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
  static: Uint8Array
  specialized: 'Uint8Array'
  kind: 'Uint8Array'
  type: 'object'
}

// --------------------------------------------------------------------------
// Unknown
// --------------------------------------------------------------------------

export interface TUnknown extends TSchema {
  static: unknown
  kind: 'Unknown'
}

// --------------------------------------------------------------------------
// Unsafe
// --------------------------------------------------------------------------

export interface TUnsafe<T> extends TSchema {
  static: T
  kind: 'Any'
}

// --------------------------------------------------------------------------
// Void
// --------------------------------------------------------------------------

export interface TVoid extends TSchema {
  static: void
  kind: 'Void'
  type: 'null'
}

// --------------------------------------------------------------------------
// Static<T>
// --------------------------------------------------------------------------

export type Static<T extends TSchema, P extends unknown[] = []> = (T & { params: P })['static']

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
    return { modifier: 'ReadonlyOptional', ...item }
  }

  /** Creates a readonly property */
  public Readonly<T extends TSchema>(item: T): TReadonly<T> {
    return { modifier: 'Readonly', ...item }
  }

  /** Creates a optional property */
  public Optional<T extends TSchema>(item: T): TOptional<T> {
    return { modifier: 'Optional', ...item }
  }

  // ----------------------------------------------------------------------
  // Types
  // ----------------------------------------------------------------------

  /** Creates a any type */
  public Any(options: SchemaOptions = {}): TAny {
    return this.Create<TAny>({ ...options, kind: 'Any' })
  }

  /** Creates a array type */
  public Array<T extends TSchema>(items: T, options: ArrayOptions = {}): TArray<T> {
    return this.Create<TArray<T>>({ ...options, kind: 'Array', type: 'array', items })
  }

  /** Creates a boolean type */
  public Boolean(options: SchemaOptions = {}): TBoolean {
    return this.Create({ ...options, kind: 'Boolean', type: 'boolean' })
  }

  /** Creates a constructor type */
  public Constructor<T extends TSchema[], U extends TObject>(parameters: [...T], returns: U, options: SchemaOptions = {}): TConstructor<T, U> {
    return this.Create({ ...options, kind: 'Constructor', type: 'constructor', parameters, returns })
  }

  /** Creates a enum type */
  public Enum<T extends Record<string, string | number>>(item: T, options: SchemaOptions = {}): TEnum<T> {
    const values = Object.keys(item)
      .filter((key) => isNaN(key as any))
      .map((key) => item[key]) as T[keyof T][]
    const anyOf = values.map((value) => (typeof value === 'string' ? { type: 'string' as const, const: value } : { type: 'number' as const, const: value }))
    return this.Create({ ...options, kind: 'Enum', anyOf })
  }

  /** Creates a function type */
  public Function<T extends readonly TSchema[], U extends TSchema>(parameters: [...T], returns: U, options: SchemaOptions = {}): TFunction<T, U> {
    return this.Create({ ...options, kind: 'Function', type: 'function', parameters, returns })
  }

  /** Creates a integer type */
  public Integer(options: IntegerOptions = {}): TInteger {
    return this.Create({ ...options, kind: 'Integer', type: 'integer' })
  }

  /** Creates a intersect type. */
  public Intersect<T extends TObject[]>(objects: [...T], options: ObjectOptions = {}): TIntersect<T> {
    const isOptional = (schema: TSchema) => (schema.modifier && schema.modifier === 'Optional') || schema.modifier === 'ReadonlyOptional'
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
        delete schema.modifier
        properties[key] = properties[key] === undefined ? schema : { kind: 'Union', anyOf: [properties[key], { ...schema }] }
      }
    }
    return this.Create({ ...options, type: 'object', kind: 'Object', properties, required: [...required] })
  }

  /** Creates a keyof type */
  public KeyOf<T extends TObject>(object: T, options: SchemaOptions = {}): TKeyOf<T> {
    const keys = Object.keys(object.properties)
    return this.Create({ ...options, kind: 'KeyOf', type: 'string', enum: keys })
  }

  /** Creates a literal type. */
  public Literal<T extends TLiteralValue>(value: T, options: SchemaOptions = {}): TLiteral<T> {
    return this.Create({ ...options, kind: 'Literal', const: value, type: typeof value as 'string' | 'number' | 'boolean' })
  }

  /** Creates a null type */
  public Null(options: SchemaOptions = {}): TNull {
    return this.Create({ ...options, kind: 'Null', type: 'null' })
  }

  /** Creates a number type */
  public Number(options: NumberOptions = {}): TNumber {
    return this.Create({ ...options, kind: 'Number', type: 'number' })
  }

  /** Creates an object type with the given properties */
  public Object<T extends TProperties>(properties: T, options: ObjectOptions = {}): TObject<T> {
    const property_names = Object.keys(properties)
    const optional = property_names.filter((name) => {
      const property = properties[name] as TModifier
      const modifier = property.modifier
      return modifier && (modifier === 'Optional' || modifier === 'ReadonlyOptional')
    })
    const required_names = property_names.filter((name) => !optional.includes(name))
    const required = required_names.length > 0 ? required_names : undefined
    return this.Create(required ? { ...options, kind: 'Object', type: 'object', properties, required } : { ...options, kind: 'Object', type: 'object', properties })
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

  /** Creates a partial type from an existing object */
  public Partial<T extends TObject>(schema: T, options: ObjectOptions = {}): TPartial<T> {
    const next = { ...(this.Clone(schema) as T), ...options }
    delete next.required
    for (const key of Object.keys(next.properties)) {
      const property = next.properties[key]
      const modifier = property.modifier
      switch (modifier) {
        case 'ReadonlyOptional':
          property.modifier = 'ReadonlyOptional'
          break
        case 'Readonly':
          property.modifier = 'ReadonlyOptional'
          break
        case 'Optional':
          property.modifier = 'Optional'
          break
        default:
          property.modifier = 'Optional'
          break
      }
    }
    return this.Create(next as unknown as TPartial<T>)
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
    return this.Create({ ...options, kind: 'Promise', type: 'promise', item })
  }

  /** Creates a record type */
  public Record<K extends TRecordKey, T extends TSchema>(key: K, value: T, options: ObjectOptions = {}): TRecord<K, T> {
    const pattern = (() => {
      switch (key.kind) {
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
    return this.Create({ ...options, kind: 'Record', type: 'object', patternProperties: { [pattern]: value } })
  }

  /** Creates a recursive object type */
  public Rec<T extends TSchema>(callback: (self: TSelf) => T, options: SchemaOptions = {}): TRec<T> {
    if (options.$id === undefined) options.$id = `type-${TypeOrdinal++}`
    const self = callback({ kind: 'Self', $ref: `${options.$id}` } as any)
    self.$id = options.$id
    return this.Create({ ...options, ...self } as any)
  }

  /** Creates a reference schema */
  public Ref<T extends TSchema>(schema: T): TRef<T> {
    if (schema.$id === undefined) throw Error('Cannot reference schema as it has no Id')
    return this.Create({ $ref: schema.$id! })
  }

  /** Creates a string type from a regular expression */
  public RegEx(regex: RegExp, options: SchemaOptions = {}): TString {
    return this.Create({ ...options, kind: 'String', type: 'string', pattern: regex.source })
  }

  /** Makes all properties in the given object type required */
  public Required<T extends TObject>(schema: T, options: SchemaOptions = {}): TRequired<T> {
    const next = { ...(this.Clone(schema) as T), ...options }
    next.required = Object.keys(next.properties)
    for (const key of Object.keys(next.properties)) {
      const property = next.properties[key]
      const modifier = property.modifier
      switch (modifier) {
        case 'ReadonlyOptional':
          property.modifier = 'Readonly'
          break
        case 'Readonly':
          property.modifier = 'Readonly'
          break
        case 'Optional':
          delete property.modifier
          break
        default:
          delete property.modifier
          break
      }
    }
    return this.Create(next as unknown as TRequired<T>)
  }

  /** Creates a string type */
  public String<TCustomFormatOption extends string>(options: StringOptions<StringFormatOption | TCustomFormatOption> = {}): TString {
    return this.Create({ ...options, kind: 'String', type: 'string' })
  }

  /** Creates a type type */
  public Tuple<T extends TSchema[]>(items: [...T], options: SchemaOptions = {}): TTuple<T> {
    const additionalItems = false
    const minItems = items.length
    const maxItems = items.length
    const schema = (items.length > 0 ? { ...options, kind: 'Tuple', type: 'array', items, additionalItems, minItems, maxItems } : { ...options, kind: 'Tuple', type: 'array', minItems, maxItems }) as any
    return this.Create(schema)
  }

  /** Creates a undefined type. This type cannot be used in service contracts and is non-validatable over the network. */
  public Undefined(options: SchemaOptions = {}): TUndefined {
    return this.Create<TUndefined>({ ...options, kind: 'Undefined', type: 'object', specialized: 'Undefined' })
  }

  /** Creates a union type */
  public Union<T extends TSchema[]>(items: [...T], options: SchemaOptions = {}): TUnion<T> {
    return this.Create<TUnion<T>>({ ...options, kind: 'Union', anyOf: items })
  }

  /** Creates a Uint8Array type. This type is only supported for binary message formats. */
  public Uint8Array(options: TypedArrayOptions = {}): TUint8Array {
    return this.Create<TUint8Array>({ ...options, kind: 'Uint8Array', type: 'object', specialized: 'Uint8Array' })
  }

  /** Creates an unknown type */
  public Unknown(options: SchemaOptions = {}): TUnknown {
    return this.Create<TUnknown>({ ...options, kind: 'Unknown' })
  }

  /** An unsafe type is the same as `any` but infers as the generic argument T. */
  public Unsafe<T>(options: SchemaOptions = {}): TUnsafe<T> {
    return this.Create({ ...options, kind: 'Any' })
  }

  /** Creates a void type. This type creates a `null` schema but infers as void */
  public Void(options: SchemaOptions = {}): TVoid {
    return this.Create({ ...options, kind: 'Void', type: 'null' })
  }

  /** Clones the given object */
  protected Clone(object: any): any {
    const isObject = (object: any): object is Record<string | symbol, any> => typeof object === 'object' && object !== null && !Array.isArray(object)
    const isArray = (object: any): object is any[] => typeof object === 'object' && object !== null && Array.isArray(object)
    if (isObject(object)) {
      return Object.keys(object).reduce(
        (acc, key) => ({
          ...acc,
          [key]: this.Clone(object[key]),
        }),
        Object.getOwnPropertySymbols(object).reduce(
          (acc, key) => ({
            ...acc,
            [key]: this.Clone(object[key]),
          }),
          {},
        ),
      )
    } else if (isArray(object)) {
      return object.map((item: any) => this.Clone(item))
    } else {
      return object
    }
  }

  /** Accepts a schema and asserts on the properties excluding phantom static and params  */
  protected Create<T>(schema: Omit<T, 'static' | 'params'>): T {
    return schema as any
  }
}

/** JSON Schema Type Builder with Static Type Resolution for TypeScript */
export const Type = new TypeBuilder()
