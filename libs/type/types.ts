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
// TSchema
// --------------------------------------------------------------------------

export interface SchemaOptions {
    $schema?: string
    $id?: string
    title?: string
    description?: string
    default?: any
    examples?: any
    [prop: string]: any
}

export interface TSchema extends SchemaOptions {
    $static: unknown
    kind: string
    modifier?: string
}

// --------------------------------------------------------------------------
// TAny
// --------------------------------------------------------------------------

export interface TAny extends TSchema {
    $static: any,
    kind: 'Any'
}

// --------------------------------------------------------------------------
// TArray
// --------------------------------------------------------------------------

export interface ArrayOptions extends SchemaOptions {
    uniqueItems?: boolean
    minItems?: number
    maxItems?: number
}

export interface TArray<T extends TSchema = TSchema> extends TSchema, ArrayOptions {
    $static: T['$static'][],
    kind: 'Array',
    type: 'array',
    items: T
}

// --------------------------------------------------------------------------
// TBoolean
// --------------------------------------------------------------------------

export interface TBoolean extends TSchema {
    $static: boolean,
    kind: 'Boolean',
    type: 'boolean'
}

// --------------------------------------------------------------------------
// TConstructor
// --------------------------------------------------------------------------

type StaticConstructorParameters<T extends readonly TSchema[]> = [...{ [K in keyof T]: T[K] extends TSchema ? T[K]['$static'] : never }]

export interface TConstructor<T extends TSchema[] = TSchema[], U extends TSchema = TSchema> extends TSchema {
    $static: new (...param: StaticConstructorParameters<T>) => U['$static'],
    kind: 'Constructor',
    type: 'constructor',
    parameters: T,
    returns: U
}

// --------------------------------------------------------------------------
// TEnum
// --------------------------------------------------------------------------

export interface TEnumOption<T> {
    type: 'number' | 'string'
    const: T
}

export interface TEnum<T extends Record<string, string | number>> extends TSchema {
    $static: T[keyof T]
    kind: 'Enum'
    anyOf: TEnumOption<T>[]
}

// --------------------------------------------------------------------------
// TFunction
// --------------------------------------------------------------------------

type StaticParameters<T extends readonly TSchema[]> = [...{ [K in keyof T]: T[K] extends TSchema ? T[K]['$static'] : never }]

export interface TFunction<T extends readonly TSchema[] = TSchema[], U extends TSchema = TSchema> extends TSchema {
    $static: (...param: StaticParameters<T>) => U['$static'],
    kind: 'Function',
    type: 'function',
    parameters: T,
    returns: U
}

// --------------------------------------------------------------------------
// TInteger
// --------------------------------------------------------------------------

export interface IntegerOptions extends SchemaOptions {
    exclusiveMaximum?: number
    exclusiveMinimum?: number
    maximum?: number
    minimum?: number
    multipleOf?: number
}

export interface TInteger extends TSchema, IntegerOptions {
    $static: number,
    kind: 'Integer',
    type: 'integer'
}
// --------------------------------------------------------------------------
// TIntersect
// --------------------------------------------------------------------------

type StaticIntersectEvaluate<T extends readonly TSchema[]> = { [K in keyof T]: T[K] extends TSchema ? T[K]['$static'] : never }

type StaticIntersectReduce<I extends unknown, T extends readonly any[]> = T extends [infer A, ...infer B] ? StaticIntersectReduce<I & A, B> : I

export interface IntersectOptions extends SchemaOptions {
    unevaluatedProperties?: boolean
}

export interface TIntersect<T extends TSchema[] = TSchema[]> extends TSchema, IntersectOptions {
    $static: StaticIntersectReduce<unknown, StaticIntersectEvaluate<T>>,
    kind: 'Intersect',
    type: 'object',
    allOf: T
}

// --------------------------------------------------------------------------
// TKeyOf
// --------------------------------------------------------------------------

export interface TKeyOf<T extends TObject | TRef<TObject>> extends TSchema {
    $static: keyof T['$static']
    kind: 'KeyOf'
    enum: keyof T['$static'][]
}

// --------------------------------------------------------------------------
// TLiteral
// --------------------------------------------------------------------------

export type TLiteralValue = string | number | boolean

export interface TLiteral<T extends TLiteralValue = TLiteralValue> extends TSchema {
    $static: T,
    kind: 'Literal',
    const: T
}

// --------------------------------------------------------------------------
// TNamespace
// --------------------------------------------------------------------------

export interface TDefinitions {
    [name: string]: TSchema
}

export interface TNamespace<T extends TDefinitions = TDefinitions> extends TSchema {
    $static: { [K in keyof T]: T[K] extends TSchema ? T[K]['$static'] : never }
    kind: 'Namespace',
    $defs: T
}

// --------------------------------------------------------------------------
// TNull
// --------------------------------------------------------------------------

export interface TNull extends TSchema {
    $static: null,
    kind: 'Null',
    type: 'null'
}

// --------------------------------------------------------------------------
// TNumber
// --------------------------------------------------------------------------

export interface NumberOptions extends SchemaOptions {
    exclusiveMaximum?: number
    exclusiveMinimum?: number
    maximum?: number
    minimum?: number
    multipleOf?: number
}

export interface TNumber extends TSchema, NumberOptions {
    $static: number,
    kind: 'Number',
    type: 'number'
}

// --------------------------------------------------------------------------
// TObject
// --------------------------------------------------------------------------

type StaticReadonlyOptionalPropertyKeys<T extends TProperties> = { [K in keyof T]: T[K] extends TReadonlyOptional<TSchema> ? K : never }[keyof T]

type StaticReadonlyPropertyKeys<T extends TProperties> = { [K in keyof T]: T[K] extends TReadonly<TSchema> ? K : never }[keyof T]

type StaticOptionalPropertyKeys<T extends TProperties> = { [K in keyof T]: T[K] extends TOptional<TSchema> ? K : never }[keyof T]

type StaticRequiredPropertyKeys<T extends TProperties> = keyof Omit<T, StaticReadonlyOptionalPropertyKeys<T> | StaticReadonlyPropertyKeys<T> | StaticOptionalPropertyKeys<T>>

type StaticProperties<T extends TProperties> =
    (
        { readonly [K in StaticReadonlyOptionalPropertyKeys<T>]?: T[K]['$static'] } &
        { readonly [K in StaticReadonlyPropertyKeys<T>]: T[K]['$static'] } &
        { [K in StaticOptionalPropertyKeys<T>]?: T[K]['$static'] } &
        { [K in StaticRequiredPropertyKeys<T>]: T[K]['$static'] }
    ) extends infer R ? {
        [K in keyof R]: R[K]
    } : never

export interface TProperties { [key: string]: TSchema }

export interface ObjectOptions extends SchemaOptions {
    additionalProperties?: boolean
    minProperties?: number
    maxProperties?: number
}

export interface TObject<T extends TProperties = TProperties> extends TSchema, ObjectOptions {
    $static: StaticProperties<T>
    kind: 'Object',
    type: 'object',
    properties: T,
    required?: string[]
}

// --------------------------------------------------------------------------
// TOmit
// --------------------------------------------------------------------------

export interface TOmit<T extends TObject, Properties extends Array<keyof T['properties']>> extends TObject {
    $static: Omit<T['$static'], Properties[number] extends keyof T['$static'] ? Properties[number] : never>
    properties: T extends TObject ? Omit<T['properties'], Properties[number]> : never
}

// --------------------------------------------------------------------------
// TPartial
// --------------------------------------------------------------------------

export interface TPartial<T extends TObject | TRef<TObject>> extends TObject {
    $static: Partial<T['$static']>
}

// --------------------------------------------------------------------------
// TPick
// --------------------------------------------------------------------------

export interface TPick<T extends TObject, Properties extends Array<keyof T['properties']>> extends TObject {
    $static: Pick<T['$static'], Properties[number] extends keyof T['$static'] ? Properties[number] : never>
    properties: T extends TObject ? Pick<T['properties'], Properties[number]> : never
}

// --------------------------------------------------------------------------
// TPromise
// --------------------------------------------------------------------------

export interface TPromise<T extends TSchema> extends TSchema {
    $static: Promise<T['$static']>,
    kind: 'Promise',
    type: 'promise',
    item: TSchema
}

// --------------------------------------------------------------------------
// TRecord
// --------------------------------------------------------------------------

export type TRecordKey = TString | TNumber | TRegEx | TKeyOf<any> | TUnion<any>

export type StaticRecord<K extends TRecordKey, T extends TSchema> =
    K extends TString ? Record<string, T['$static']> :
    K extends TNumber ? Record<number, T['$static']> :
    K extends TRegEx ? Record<string, T['$static']> :
    K extends TKeyOf<TObject | TRef<TObject>> ? Record<K['$static'], T['$static']> :
    K extends TUnion<TLiteral[]> ? K['$static'] extends string ? Record<K['$static'], T['$static']> : never :
    never

export interface TRecord<K extends TRecordKey, T extends TSchema> extends TSchema {
    $static: StaticRecord<K, T>,
    kind: 'Record',
    type: 'object',
    patternProperties: { [pattern: string]: T }
}

// --------------------------------------------------------------------------
// TRec
// --------------------------------------------------------------------------

export interface TRec<T extends TSchema> extends TSchema {
    $static: T['$static']
    kind: 'TRec'
    $ref: string,
    $defs: unknown
}

// --------------------------------------------------------------------------
// TRef
// --------------------------------------------------------------------------

export interface TRef<T extends TSchema> extends TSchema {
    $static: T['$static'],
    kind: 'Ref',
    $ref: string
}

// --------------------------------------------------------------------------
// TRegEx
// --------------------------------------------------------------------------

export interface TRegEx extends TSchema {
    $static: string
    kind: 'RegEx'
    type: 'string'
    pattern: string
}

// --------------------------------------------------------------------------
// TRequired
// --------------------------------------------------------------------------

export interface TRequired<T extends TObject | TRef<TObject>> extends TObject {
    $static: Required<T['$static']>
}

// --------------------------------------------------------------------------
// TString
// --------------------------------------------------------------------------

export type StringFormatOption =
    | 'date-time' | 'time' | 'date' | 'email' | 'idn-email' | 'hostname'
    | 'idn-hostname' | 'ipv4' | 'ipv6' | 'uri' | 'uri-reference' | 'iri'
    | 'uuid' | 'iri-reference' | 'uri-template' | 'json-pointer' | 'relative-json-pointer'
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
    $static: string,
    kind: 'String',
    type: 'string'
}

// --------------------------------------------------------------------------
// TTuple
// --------------------------------------------------------------------------

export interface TTuple<T extends TSchema[] = TSchema[]> extends TSchema {
    $static: [...{ [K in keyof T]: T[K] extends TSchema ? T[K]['$static'] : never }],
    kind: 'Tuple',
    type: 'array',
    items?: T,
    additionalItems?: false,
    minItems: number,
    maxItems: number
}

// --------------------------------------------------------------------------
// TUndefined
// --------------------------------------------------------------------------

export interface TUndefined extends TSchema {
    $static: undefined
    specialized: 'Undefined'
    kind: 'Undefined'
    type: 'object'
}

// --------------------------------------------------------------------------
// TUnion
// --------------------------------------------------------------------------

export interface TUnion<T extends TSchema[] = TSchema[]> extends TSchema {
    $static: { [K in keyof T]: T[K] extends TSchema ? Static<T[K]> : never }[number],
    kind: 'Union',
    anyOf: T
}

// -------------------------------------------------------------------------
// TUint8Array
// -------------------------------------------------------------------------

export interface TypedArrayOptions {
    maxByteLength?: number,
    minByteLength?: number
}

export interface TUint8Array extends TSchema, TypedArrayOptions {
    $static: Uint8Array
    specialized: 'Uint8Array'
    kind: 'Uint8Array'
    type: 'object'
}

// --------------------------------------------------------------------------
// TUnknown
// --------------------------------------------------------------------------

export interface TUnknown extends TSchema {
    $static: unknown,
    kind: 'Unknown'
}

// --------------------------------------------------------------------------
// TUnsafe
// --------------------------------------------------------------------------

export interface TUnsafe<T> extends TSchema {
    $static: T,
    kind: 'Any'
}

// --------------------------------------------------------------------------
// TVoid
// --------------------------------------------------------------------------

export interface TVoid extends TSchema {
    $static: void,
    kind: 'Void',
    type: 'null'
}

// --------------------------------------------------------------------------
// Static<T>
// --------------------------------------------------------------------------

export type Static<T extends TSchema> = T['$static']


// --------------------------------------------------------------------------
// TypeBuilder
// --------------------------------------------------------------------------

export class TypeBuilder {

    protected readonly schemas: Map<string, TSchema>

    constructor() {
        this.schemas = new Map<string, TSchema>()
    }

    // ----------------------------------------------------------------------
    // Modifiers
    // ----------------------------------------------------------------------


    /** Modifies an object property to be both readonly and optional */
    public ReadonlyOptional<T extends TSchema>(item: T): TReadonlyOptional<T> {
        return { modifier: 'ReadonlyOptional', ...item }
    }

    /** Modifies an object property to be readonly */
    public Readonly<T extends TSchema>(item: T): TReadonly<T> {
        return { modifier: 'Readonly', ...item }
    }

    /** Modifies an object property to be optional */
    public Optional<T extends TSchema>(item: T): TOptional<T> {
        return { modifier: 'Optional', ...item }
    }

    // ----------------------------------------------------------------------
    // Types
    // ----------------------------------------------------------------------

    /** Creates an any type */
    public Any(options: SchemaOptions = {}): TAny {
        return this.Create({ ...options, kind: 'Any' })
    }

    /** Creates an array type */
    public Array<T extends TSchema>(items: T, options: ArrayOptions = {}): TArray<T> {
        return this.Create({ ...options, kind: 'Array', type: 'array', items })
    }

    /** Creates a boolean type */
    public Boolean(options: SchemaOptions = {}): TBoolean {
        return this.Create({ ...options, kind: 'Boolean', type: 'boolean' })
    }

    /** Creates a constructor type */
    public Constructor<T extends TSchema[], U extends TSchema>(parameters: [...T], returns: U, options: SchemaOptions = {}): TConstructor<T, U> {
        return this.Create({ ...options, kind: 'Constructor', type: 'constructor', parameters, returns })
    }

    /** Creates an enum type from a TypeScript enum */
    public Enum<T extends Record<string, string | number>>(item: T, options: SchemaOptions = {}): TEnum<T> {
        const values = Object.keys(item).filter(key => isNaN(key as any)).map(key => item[key]) as T[keyof T][]
        const anyOf = values.map(value => typeof value === 'string' ? { type: 'string' as const, const: value } : { type: 'number' as const, const: value })
        return this.Create({ ...options, kind: 'Enum', anyOf })
    }

    /** Creates a function type */
    public Function<T extends readonly TSchema[], U extends TSchema>(parameters: [...T], returns: U, options: SchemaOptions = {}): TFunction<T, U> {
        return this.Create({ ...options, kind: 'Function', type: 'function', parameters, returns })
    }

    /** Creates an integer type */
    public Integer(options: IntegerOptions = {}): TInteger {
        return this.Create({ ...options, kind: 'Integer', type: 'integer' })
    }

    /** Creates an intersect type. */
    public Intersect<T extends TSchema[]>(items: [...T], options: IntersectOptions = {}): TIntersect<T> {
        return this.Create({ ...options, kind: 'Intersect', type: 'object', allOf: items })
    }

    /** Creates a keyof type from the given object */
    public KeyOf<T extends TObject | TRef<TObject>>(object: T, options: SchemaOptions = {}): TKeyOf<T> {
        const source = this.Deref(object)
        const keys = Object.keys(source.properties)
        return this.Create({ ...options, kind: 'KeyOf', type: 'string', enum: keys })
    }

    /** Creates a literal type. Supports string, number and boolean values only */
    public Literal<T extends TLiteralValue>(value: T, options: SchemaOptions = {}): TLiteral<T> {
        return this.Create({ ...options, kind: 'Literal', const: value, type: typeof value as 'string' | 'number' | 'boolean' })
    }

    /** Creates a namespace for a set of related types */
    public Namespace<T extends TDefinitions>($defs: T, options: SchemaOptions = {}): TNamespace<T> {
        return this.Create({ ...options, kind: 'Namespace', $defs })
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
        const optional = property_names.filter(name => {
            const property = properties[name] as TModifier
            const modifier = property.modifier
            return (modifier &&
                (modifier === 'Optional' ||
                    modifier === 'ReadonlyOptional'))
        })
        const required_names = property_names.filter(name => !optional.includes(name))
        const required = (required_names.length > 0) ? required_names : undefined
        return this.Create(((required)
            ? { ...options, kind: 'Object', type: 'object', properties, required }
            : { ...options, kind: 'Object', type: 'object', properties }))
    }

    /** Omits property keys from the given object type */
    public Omit<T extends TObject, Keys extends Array<keyof T['properties']>>(object: T, keys: [...Keys], options: SchemaOptions = {}): TOmit<T, Keys> {
        const source = this.Deref(object)
        const schema = { ...this.Clone(source), ...options }
        schema.required = schema.required ? schema.required.filter((key: string) => !keys.includes(key as any)) : undefined
        for (const key of Object.keys(schema.properties)) {
            if (keys.includes(key as any)) delete schema.properties[key]
        }
        return this.Create(schema)
    }

    /** Makes all properties in the given object type optional */
    public Partial<T extends TObject | TRef<TObject>>(object: T, options: ObjectOptions = {}): TPartial<T> {
        const source = this.Deref(object)
        const schema = { ...this.Clone(source) as T, ...options }
        delete schema.required
        for (const key of Object.keys(schema.properties)) {
            const property = schema.properties[key]
            const modifier = property.modifier
            switch (modifier) {
                case 'ReadonlyOptional': property.modifier = 'ReadonlyOptional'; break;
                case 'Readonly': property.modifier = 'ReadonlyOptional'; break;
                case 'Optional': property.modifier = 'Optional'; break;
                default: property.modifier = 'Optional'; break;
            }
        }
        return this.Create(schema as unknown as TPartial<T>)
    }

    /** Picks property keys from the given object type */
    public Pick<T extends TObject, Keys extends Array<keyof T['properties']>>(object: T, keys: [...Keys], options: SchemaOptions = {}): TPick<T, Keys> {
        const source = this.Deref(object)
        const schema = { ...this.Clone(source), ...options }
        schema.required = schema.required ? schema.required.filter((key: any) => keys.includes(key)) : undefined
        for (const key of Object.keys(schema.properties)) {
            if (!keys.includes(key as any)) delete schema.properties[key]
        }
        return this.Create(schema)
    }

    /** Creates a promise type. This type cannot be represented in schema. */
    public Promise<T extends TSchema>(item: T, options: SchemaOptions = {}): TPromise<T> {
        return this.Create({ ...options, kind: 'Promise', type: 'promise', item })
    }
    
    /** Creates a record type */
    public Record<K extends TRecordKey, T extends TSchema>(key: K, value: T, options: ObjectOptions = {}): TRecord<K, T> {
        const pattern = (() => {
            switch (key.kind) {
                case 'Union': return `^${key.anyOf.map((literal: any) => literal.const as TLiteralValue).join('|')}$`
                case 'KeyOf': return `^${(<any>(key.enum)).join('|')}$`
                case 'Number': return '^(0|[1-9][0-9]*)$'
                case 'String': return key.pattern ? key.pattern : '^.*$'
                case 'RegEx': return key.pattern
                default: throw Error('Invalid Record Key')
            }
        })()
        return this.Create({ ...options, kind: 'Record', type: 'object', patternProperties: { [pattern]: value } })
    }

    /** `Experimental` Creates a recursive type */
    public Rec<T extends TSchema>(callback: (self: TAny) => T, options: SchemaOptions = {}): TRec<T> {
        const $id = options.$id || ''
        const self = callback({ $ref: `${$id}#/$defs/self` } as any)
        return this.Create({ ...options, kind: 'Rec', $ref: `${$id}#/$defs/self`, $defs: { self } } as any)
    }

    /** References a type within a namespace. The referenced namespace must specify an `$id` */
    public Ref<T extends TNamespace, K extends keyof T['$defs']>(namespace: T, key: K): TRef<T['$defs'][K]>

    /** References type. The referenced type must specify an `$id` */
    public Ref<T extends TSchema>(schema: T): TRef<T>

    public Ref(...args: any[]): any {
        if (args.length === 2) {
            const namespace = args[0] as TNamespace<TDefinitions>
            const targetKey = args[1] as string
            if (namespace.$id === undefined) throw new Error(`Referenced namespace has no $id`)
            if (!this.schemas.has(namespace.$id)) throw new Error(`Unable to locate namespace with $id '${namespace.$id}'`)
            return this.Create({ kind: 'Ref', $ref: `${namespace.$id}#/$defs/${targetKey}` })
        } else if (args.length === 1) {
            const target = args[0] as any
            if (target.$id === undefined) throw new Error(`Referenced schema has no $id`)
            if (!this.schemas.has(target.$id)) throw new Error(`Unable to locate schema with $id '${target.$id}'`)
            return this.Create({ kind: 'Ref', $ref: target.$id })
        } else {
            throw new Error('Type.Ref: Invalid arguments')
        }
    }

    /** Creates a string type from a regular expression */
    public RegEx(regex: RegExp, options: SchemaOptions = {}): TRegEx {
        return this.Create({ ...options, kind: 'RegEx', type: 'string', pattern: regex.source })
    }

    /** Makes all properties in the given object type required */
    public Required<T extends TObject | TRef<TObject>>(object: T, options: SchemaOptions = {}): TRequired<T> {
        const source = this.Deref(object)
        const schema = { ...this.Clone(source) as T, ...options }
        schema.required = Object.keys(schema.properties)
        for (const key of Object.keys(schema.properties)) {
            const property = schema.properties[key]
            const modifier = property.modifier
            switch (modifier) {
                case 'ReadonlyOptional': property.modifier = 'Readonly'; break;
                case 'Readonly': property.modifier = 'Readonly'; break;
                case 'Optional': delete property.modifier; break;
                default: delete property.modifier; break;
            }
        }
        return this.Create(schema as unknown as TRequired<T>)
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
        const schema = ((items.length > 0)
            ? { ...options, kind: 'Tuple', type: 'array', items, additionalItems, minItems, maxItems }
            : { ...options, kind: 'Tuple', type: 'array', minItems, maxItems }) as any
        return this.Create(schema)
    }

    /** Creates a undefined type. This type cannot be used in service contracts and is non-validatable over the network. */
    public Undefined(options: SchemaOptions = {}): TUndefined {
        return this.Create({ ...options, kind: 'Undefined', type: 'object', specialized: 'Undefined' })
    }

    /** Creates a union type */
    public Union<T extends TSchema[]>(items: [...T], options: SchemaOptions = {}): TUnion<T> {
        return this.Create({ ...options, kind: 'Union', anyOf: items })
    }

    /** Creates a Uint8Array type. This type is only supported for binary message formats. */
    public Uint8Array(options: TypedArrayOptions = {}): TUint8Array {
        return this.Create({ ...options, kind: 'Uint8Array', type: 'object', specialized: 'Uint8Array' })
    }

    /** Creates an unknown type */
    public Unknown(options: SchemaOptions = {}): TUnknown {
        return this.Create({ ...options, kind: 'Unknown' })
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
            return Object.keys(object).reduce((acc, key) => ({
                ...acc, [key]: this.Clone(object[key])
            }), Object.getOwnPropertySymbols(object).reduce((acc, key) => ({
                ...acc, [key]: this.Clone(object[key])
            }), {}))
        } else if (isArray(object)) {
            return object.map((item: any) => this.Clone(item))
        } else {
            return object
        }
    }

    /** Conditionally stores and schema if it contains an $id and returns  */
    protected Create<T extends TSchema>(schema: Omit<T, '$static'>): T {
        const $schema: any = schema
        if (!$schema['$id']) return $schema
        this.schemas.set($schema['$id'], $schema)
        return $schema
    }

    /** Conditionally dereferences a schema if RefKind. Otherwise return argument */
    protected Deref<T extends TSchema>(schema: T): any {
        const $schema: any = schema
        if ($schema.kind !== 'Ref') return schema
        if (!this.schemas.has($schema['$ref'])) throw Error(`Unable to locate schema with $id '${$schema['$ref']}'`)
        return this.Deref(this.schemas.get($schema['$ref'])!)
    }
}

/** JSON Schema Type Builder with Static Type Resolution for TypeScript */
export const Type = new TypeBuilder()