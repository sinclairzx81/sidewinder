import { Validator } from '@sidewinder/validator'
import { Value } from '@sidewinder/value'
import { Type, Static } from '@sidewinder/type'
import * as Types from '@sidewinder/type'


export namespace Compiler {
    const referenceMap = new Map<string, Types.TSchema>()

    function* Any(schema: Types.TAny, path: string): Generator<string> {
    }

    function* Array(schema: Types.TArray, path: string): Generator<string> {
        const expr = [...Visit(schema.items, `value`)].join(' && ')
        yield `(globalThis.Array.isArray(${path}) && ${path}.every(value => ${expr}))`
    }

    function* Boolean(schema: Types.TBoolean, path: string): Generator<string> {
        yield `(typeof ${path} === 'boolean')`
    }

    function* Constructor(schema: Types.TConstructor, path: string): Generator<string> {
        yield* Visit(schema.yields, path)
    }

    function* Enum(schema: Types.TEnum<any>, path: string): Generator<string> {
        yield ``
    }

    function* Function(schema: Types.TFunction, path: string): Generator<string> {
        yield `(typeof ${path} === 'function')`
    }

    function* Integer(schema: Types.TNumeric, path: string): Generator<string> {
        yield `(typeof ${path} === 'number' && globalThis.Number.isInteger(${path}))`
    }

    function* Intersect(schema: Types.TIntersect, path: string): Generator<string> {
        yield* Object(schema, path)
    }

    function* Literal(schema: Types.TLiteral, path: string): Generator<string> {
        yield `${schema.const} === ${path}`
    }

    function* Null(schema: Types.TNull, path: string): Generator<string> {
        yield `(${path} === null)`
    }

    function* Number(schema: Types.TNumeric, path: string): Generator<string> {
        yield `(typeof ${path} === 'number')`
    }

    function* Object(schema: Types.TObject, path: string): Generator<string> {
        yield `(typeof ${path} === 'object' && ${path} !== null)`
        const propertyKeys = globalThis.Object.keys(schema.properties)
        if (schema.additionalProperties === false) {
            // optimization: If the property key length matches the required keys length
            // then we only need check that the values property key length matches that
            // of the property key length. This is because exhaustive testing for values 
            // will occur in subsequent property tests.
            if(schema.required && schema.required.length === propertyKeys.length) {
                yield `${propertyKeys.length} === globalThis.Object.keys(${path}).length`
            } 
            // exhaustive: In cases where optional properties exist, then we must perform
            // an exhaustive check on the values property keys. This operation is O(n^2).
            else {
                const set = `[${propertyKeys.map(key => `'${key}'`).join(', ')}]`
                yield `globalThis.Object.keys(${path}).every(key => ${set}.includes(key))`
            }
        }
        for (const propertyKey of propertyKeys) {
            const propertySchema = schema.properties[propertyKey]
            if (schema.required && schema.required.includes(propertyKey)) {
                yield* Visit(propertySchema, `${path}.${propertyKey}`)
            } else {
                const expr = [...Visit(propertySchema, `${path}.${propertyKey}`)].join(' && ')
                yield `${path}.${propertyKey} === undefined ? true : (${expr})`
            }
        }
    }

    function* Promise(schema: Types.TPromise<any>, path: string): Generator<string> {
        yield `(typeof value === 'object' && typeof ${path}.then === 'function')`
    }

    function* Record(schema: Types.TRecord<any, any>, path: string): Generator<string> {
        // if (typeof value !== 'object' || value === null) yield false
        // const propertySchema = globalThis.Object.values(schema.patternProperties)[0]
        // for (const key of globalThis.Object.keys(value)) {
        //   const propertyValue = value[key]
        //   if (!Visit(propertySchema, propertyValue)) yield false
        // }
        // yield true
        yield ``
    }

    function* Rec(schema: Types.TRec<any>, path: string): Generator<string> {
        throw new Error('Cannot typeof recursive types')
    }

    function* Ref(schema: Types.TRef<any>, path: string): Generator<string> {
        throw new Error('Cannot typeof reference types')
    }

    function* Self(schema: Types.TSelf, path: string): Generator<string> {
        // if (!referenceMap.has(schema.$ref)) throw new Error(`Check: Cannot locate schema with $id '${schema.$id}' for referenced type`)
        // const referenced = referenceMap.get(schema.$ref)!
        // yield Visit(referenced, value)
        yield ``
    }

    function* String(schema: Types.TString, path: string): Generator<string> {
        yield `(typeof ${path} === 'string')`
        // todo: patterns - likely require stack frame precompilation
    }

    function* Tuple(schema: Types.TTuple<any[]>, path: string): Generator<string> {
        // if (typeof value !== 'object' || !globalThis.Array.isArray(value)) yield false
        // if (schema.items === undefined && value.length === 0) yield true
        // if (schema.items === undefined) yield false
        // if (value.length < schema.minItems || value.length > schema.maxItems) yield false
        // for (let i = 0; i < schema.items.length; i++) {
        //   if (!Visit(schema.items[i], value[i])) yield false
        // }
        // yield true
        yield ``
    }

    function* Undefined(schema: Types.TUndefined, path: string): Generator<string> {
        yield `${path} === undefined`
    }

    function* Union(schema: Types.TUnion<any[]>, path: string): Generator<string> {
        // for (let i = 0; i < schema.anyOf.length; i++) {
        //   if (Visit(schema.anyOf[i], value)) yield true
        // }
        // yield false
        yield ``
    }

    function* Uint8Array(schema: Types.TUint8Array, path: string): Generator<string> {
        yield `${path} instanceof globalThis.Uint8Array`
    }

    function* Unknown(schema: Types.TUnknown, path: string): Generator<string> {
    }

    function* Void(schema: Types.TVoid, path: string): Generator<string> {
        yield `${path} === null`
    }

    function* Visit<T extends Types.TSchema>(schema: T, path: string): Generator<string> {
        if (schema.$id !== undefined) referenceMap.set(schema.$id, schema)
        const anySchema = schema as any
        switch (anySchema[Types.Kind]) {
            case 'Any':
                return yield* Any(anySchema, path)
            case 'Array':
                return yield* Array(anySchema, path)
            case 'Boolean':
                return yield* Boolean(anySchema, path)
            case 'Constructor':
                return yield* Constructor(anySchema, path)
            case 'Enum':
                return yield* Enum(anySchema, path)
            case 'Function':
                return yield* Function(anySchema, path)
            case 'Integer':
                return yield* Integer(anySchema, path)
            case 'Intersect':
                return yield* Intersect(anySchema, path)
            case 'Literal':
                return yield* Literal(anySchema, path)
            case 'Null':
                return yield* Null(anySchema, path)
            case 'Number':
                return yield* Number(anySchema, path)
            case 'Object':
                return yield* Object(anySchema, path)
            case 'Promise':
                return yield* Promise(anySchema, path)
            case 'Record':
                return yield* Record(anySchema, path)
            case 'Rec':
                return yield* Rec(anySchema, path)
            case 'Ref':
                return yield* Ref(anySchema, path)
            case 'Self':
                return yield* Self(anySchema, path)
            case 'String':
                return yield* String(anySchema, path)
            case 'Tuple':
                return yield* Tuple(anySchema, path)
            case 'Undefined':
                return yield* Undefined(anySchema, path)
            case 'Union':
                return yield* Union(anySchema, path)
            case 'Uint8Array':
                return yield* Uint8Array(anySchema, path)
            case 'Unknown':
                return yield* Unknown(anySchema, path)
            case 'Void':
                return yield* Void(anySchema, path)
            default:
                throw Error(`Unknown schema kind '${schema[Types.Kind]}'`)
        }
    }

    /** Compiles this schema to an expression */
    export function Expr<T extends Types.TSchema>(schema: T): string {
        return [...Visit(schema, 'value')].join(' && ')
    }

    /** Compiles this schema validation function */
    export function Func<T extends Types.TSchema>(schema: T): (value: any) => boolean {
        const expr = [...Visit(schema, 'value')].join(' && ')
        return new globalThis.Function('value', `return ${expr}`) as any
    }

    const functionMap = new Map<Types.TSchema, (value: any) => boolean>()

    /** Checks if the value is of the given type */
    export function Check<T extends Types.TSchema>(schema: T, value: unknown): value is Static<typeof T> {
        if (!functionMap.has(schema)) functionMap.set(schema, Func(schema))
        return functionMap.get(schema)!(value)
    }
}


// $id: 'AjvTest',
// $schema: 'http://json-schema.org/draft-07/schema#',
// type: 'object',
// properties: {
//   number: {
//     type: 'number',
//   },
//   negNumber: {
//     type: 'number',
//   },
//   maxNumber: {
//     type: 'number',
//   },
//   string: {
//     type: 'string',
//   },
//   longString: {
//     type: 'string',
//   },
//   boolean: {
//     type: 'boolean',
//   },
//   deeplyNested: {
//     type: 'object',
//     properties: {
//       foo: {
//         type: 'string',
//       },
//       num: {
//         type: 'number',
//       },
//       bool: {
//         type: 'boolean',
//       },
//     },
//     required: ['foo', 'num', 'bool'],
//     additionalProperties: false,
//   },
// },
// required: [
//   'number',
//   'negNumber',
//   'maxNumber',
//   'string',
//   'longString',
//   'boolean',
//   'deeplyNested',
// ],
// additionalProperties: false,

const T = Type.Object({
    number: Type.Number(),
    negNumber: Type.Number(),
    maxNumber: Type.Number(),
    string: Type.String({ default: 'hello' }),
    longString: Type.String({ default: '1111111111111111111111111111111111111111111111111111111111111111111111' }),
    boolean: Type.Boolean(),
    deeplyNested: Type.Object({
        foo: Type.String(),
        num: Type.Number(),
        bool: Type.Boolean()
    })
})

const I = Value.Create(T)
console.log(I, Value.Check(T, I))

function ajv() {
    const validator = new Validator(T)
    const start = Date.now()
    for (let i = 0; i < 50_000_000; i++) {
        validator.check(I)
    }
    return Date.now() - start
}

function value() {
    const start = Date.now()
    for (let i = 0; i < 50_000_000; i++) {
        const x = Compiler.Check(T, I)
        if (x === false) throw 1
    }
    return Date.now() - start
}

while (true) {
    const a = ajv()
    console.log(a)
    const b = value()
    console.log(b)
    console.log(Math.round((a / b) * 100), '%')
}

const S = Type.Object({ x: Type.Number() }, { additionalProperties: false })
console.log(Value.Check(S, { x: 10, y: 10 }))
